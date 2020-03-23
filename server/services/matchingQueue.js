const Queue = require("bull");
const { matchingQueries, User } = require("../database");
const { assignThread, unassignThread } = require("../controllers/user");
const { addToNoAssign, updateStatus } = require("../controllers/thread");
const { createNotification } = require("../controllers/notifications");
const config = require("../config/config");
const io = require("./socketService");

/* job object:
    {
        thread: instance of Thread model
        currentAssignee: user_id of assignee previously set from the result obj
        pass: number of matching passes (not implemented)
    }

    result object:
    {
        assignee: user_id of assigned user, null if assignment failed + error message will be populated
    }
*/

class MatchingConfig {
  constructor() {
    this.io = io;
    this.queue = new Queue("candidate matching");
  }

  addJob(job) {
    this.queue.add(job);
  }

  runQueue() {
    this.queue.process(async (job, done) => {
      const thread = job.data.thread;
      try {
        if (thread.status >= 2) {
          throw new Error("Thread already has a reviewer");
        } else if (job.data.currentAssignee) {
          // if true, thread had been assigned previously and is now declined or timed-out
          // remove thread from the current assignee
          unassignThread(job.data.currentAssignee, thread._id);
        }
        const candidates = await matchingQueries.getCandidates(thread);
        if (candidates.length === 0) {
          throw new Error("No candidates found");
        }
        done(null, { assignee: candidates[0] }); //take the first off the list for now
      } catch (error) {
        // pass thrown errors into done function.
        done(error);
      }
    });

    this.queue.on("error", error => {
      console.error(error);
    });

    this.queue.on("failed", async (job, error) => {
      console.log(`Job failed
      ${error}`);
      if (error.message === "No candidates found") {
        console.log("clean up and rematch");
        //matching failed due to not finding any matches
        if (job.data.currentAssignee) {
          // clean up assignee if there is one
          await unassignThread(job.data.currentAssignee, job.data.thread._id);
          job.data.currentAssignee = null;
        }
        if (job.data.pass < 3) {
          //requeue if this request wasn't queued 3 times already.
          job.data.pass++;
          this.queue.add(job.data);
        } else {
          //if no matches can be found in multiple passes, enqueue a delayed search.
          this.queue.add(job.data, {
            delay: config.server.assignmentTimeout
          });
        }
      }
    });

    this.queue.on("completed", async (job, result) => {
      console.log("Job Complete");
      try {
        if (!result.assignee) {
          throw new Error("No candidates found");
        }
        const threadId = job.data.thread._id;
        const assigneeId = result.assignee._id;

        const assignedUser = await assignThread(
          //make the assignment
          assigneeId,
          threadId
        );

        console.log(`assignment succeded to user ${assignedUser.email}`);
        await createNotification({
          recipient: assigneeId,
          event: 2,
          thread: threadId,
          origin: job.data.thread.creator
        });

        await updateStatus(threadId, "assigned");
        const updatedThread = await addToNoAssign(threadId, assigneeId);
        //update job obj
        job.data.thread = updatedThread;
        job.data.currentAssignee = result.assignee._id;
        //queue a delayed job to check if the assigned thread has changed status
        this.queue.add(job.data, { delay: config.server.assignmentTimeout });
      } catch (error) {
        console.error(error);
      }
    });
  }
}

const MatchingService = new MatchingConfig();

module.exports = MatchingService;
