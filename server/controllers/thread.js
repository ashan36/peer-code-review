const mongoose = require("mongoose");
const { Thread, Post, threadQueries } = require("../database");
const {
  unassignThread,
  newRating,
  updateRating,
  getGeneralUserInfo
} = require("./user");
const config = require("../config/config");

module.exports = {
  createRequest: async data => {
    const { title, content, language, user } = data;

    if (title && content && language && user) {
      const newPost = new Post({
        author: user._id,
        authorName: user.name,
        data: content
      });

      const newThread = new Thread({
        creator: user._id,
        title,
        status: 0,
        language: { name: language.name, experience: language.experience }
      });

      const post = await newPost.save();
      newThread.posts.push(post);
      newThread.noAssign.push(user._id);
      const resultThread = await newThread.save();
      return resultThread;
    } else throw new Error("Missing required request data");
  },

  createPost: async (threadId, postData) => {
    const { author, authorName, content } = postData;
    if (author && authorName && content) {
      const newPost = new Post({
        author: author,
        authorName: authorName,
        data: content
      });
      const post = await newPost.save();
      var thread = await Thread.findById(threadId);
      thread.posts.push(post);

      // check to see if author does not have a post in thread already, so we can differentiate between
      // first review and subsequent comments for notifications
      var isFirstReview =
        thread.status === 1 && author !== thread.creator.toString();
      //Check if thread needs to be accepted
      if (isFirstReview) {
        thread.reviewer = author;
        thread.status = 2;
        unassignThread(author, thread._id);
      }
      var newThread = await thread.save();
    } else throw new Error("Missing required request data");

    // return recipient and event type based on which isFirst review
    // and commenter
    let notification = null;
    if (newThread.reviewer) {
      if (newThread.reviewer.toString() === author && isFirstReview) {
        notification = { recipient: newThread.creator, event: 1 };
      } else if (newThread.reviewer.toString() === author && !isFirstReview) {
        notification = { recipient: newThread.creator, event: 3 };
      } else {
        notification = { recipient: newThread.reviewer, event: 4 };
      }
    }
    return { thread: newThread, notification };
  },

  getRequestThreads: async (userId, status) => {
    var threads;
    switch (status) {
      case "open":
        threads = await threadQueries.getOpenUserRequests(userId);
        break;
      case "all":
        threads = await threadQueries.getAllUserRequests(userId);
        break;
      default:
        throw new Error("invalidStatusError");
    }
    return threads;
  },

  getReviewThreads: async (userId, status) => {
    var threads;
    switch (status) {
      case "open":
        threads = await threadQueries.getOpenUserReviews(userId);
        break;
      case "all":
        threads = await threadQueries.getAllUserReviews(userId);
        break;
      default:
        throw new Error("invalidStatusError");
    }
    return threads;
  },

  getAssignedThreads: async userId => {
    const user = await threadQueries.getAssignedThreads(userId);
    return user.assignedThreads;
  },

  getThreadAuthors: async threadId => {
    try {
      if (!mongoose.isValidObjectId(threadId)) {
        throw new Error("Invalid Id Error");
      }
      const thread = await Thread.findById(threadId);
      if (!thread) {
        throw new Error("Thread not found");
      }
      const users = {};
      for (let i = 0; i < thread.posts.length; i++) {
        if (!users.hasOwnProperty(thread.posts[i].author.toString())) {
          users[thread.posts[i].author.toString()] = null;
        }
      }
      let userArray = Object.keys(users);
      userArray = await getGeneralUserInfo(userArray);
      if (!userArray) {
        throw new Error("Failed to get user info");
      }
      userArray.forEach(user => {
        users[user._id] = user;
      });
      return users;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  addToNoAssign: async (threadId, userId) => {
    const newThread = await Thread.findById(threadId);
    newThread.noAssign.addToSet(userId);
    const resultThread = await newThread.save();
    return resultThread;
  },

  updateStatus: async (threadId, newStatus) => {
    const status = config.server.threadStatus.indexOf(newStatus);
    const resultThread = await Thread.updateOne(
      { _id: threadId },
      { status: status }
    );
    return resultThread;
  },

  setRating: async (threadId, rating) => {
    try {
      rating = Number(rating);
      if (rating < 0 || rating > 5) {
        throw new Error("Invalid rating value");
      }
      const thread = await Thread.findById(threadId);
      const prevRating = thread.rating;
      thread.rating = rating;
      if (thread.status === 2) {
        thread.status = 3;
        await newRating(thread.reviewer, rating);
      } else if (prevRating !== rating && thread.status > 2) {
        const ratingDelta = rating - prevRating;
        await updateRating(thread.reviewer, ratingDelta);
      }
      const resultThread = await thread.save();
      return resultThread;
    } catch (err) {
      console.error(err);
    }
  }
};
