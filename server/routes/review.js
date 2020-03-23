const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const { Thread } = require("../database");
const {
  createRequest,
  createPost,
  getRequestThreads,
  getReviewThreads,
  getAssignedThreads,
  setRating,
  getThreadAuthors
} = require("../controllers/thread");
const { createNotification } = require("../controllers/notifications");
const MatchingService = require("../services/matchingQueue");
const mongoose = require("mongoose");
const config = require("../config/config");
const io = require("../services/socketService");

const isAuth = config.server.isAuth;

router.post(
  "/create-request",
  [
    isAuth,
    check("title", "Please add a title to your request")
      .not()
      .isEmpty(),
    check("content", "Please add some content to your request")
      .not()
      .isEmpty(),
    check("language", "Please select a language for your request")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const thread = await createRequest(req.body);
      MatchingService.addJob({ thread: thread, pass: 1 }); //enqueue matching job

      return res.status(201).json({
        success: true,
        threadId: thread._id
      });
    } catch (err) {
      console.log(err);
      return res.status(500);
    }
  }
);

//push a new post onto a thread
router.post("/thread/:id/post", isAuth, async (req, res) => {
  const threadId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(threadId)) {
      throw new Error("invalidThreadIdError");
    }
    var result = await createPost(threadId, req.body);
    const { thread, notification } = result;

    if (notification) {
      if (req.body.author !== notification.recipient) {
        await createNotification({
          origin: req.body.author,
          event: notification.event,
          thread: req.params.id,
          recipient: notification.recipient
        });
      }
    }

    if (thread) {
      return res.status(201).json({
        success: true
      });
    } else {
      throw new Error();
    }
  } catch (err) {
    console.log(err);
    if (err.message === "invalidThreadIdError") {
      return res.status(404).json({
        errors: [
          {
            value: req.params.id,
            msg: "Requested thread not found",
            param: "id"
          }
        ]
      });
    }
    if (err.message === "Missing required request data") {
      return res.status(404).json({
        errors: [
          {
            msg: err.message
          }
        ]
      });
    }
    return res.sendStatus(500);
  }
});

//get a single thread by id
router.get("/thread/:id", isAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new Error("invalidThreadIdError");
    }
    const threadId = req.params.id;
    const thread = await Thread.findById(threadId);
    if (thread) {
      return res.status(200).json({
        success: true,
        thread
      });
    } else {
      throw new Error("invalidThreadIdError");
    }
  } catch (err) {
    console.log(err);
    if (err.message === "invalidThreadIdError") {
      return res.status(404).json({
        errors: [
          {
            value: req.params.id,
            msg: "Requested thread not found",
            param: "id"
          }
        ]
      });
    }
    return res.sendStatus(500);
  }
});

router.get("/thread/:threadId/posts/authors", isAuth, async (req, res) => {
  const threadId = req.params.threadId;
  try {
    const authors = await getThreadAuthors(threadId);
    if (authors) {
      res.status(200).json({
        success: true,
        authors: authors
      });
    } else throw new Error();
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid Id Error") {
      return res.status(404).json({
        errors: [
          {
            value: req.params.threadId,
            msg: "Thread not found",
            param: "threadId"
          }
        ]
      });
    } else res.sendStatus(500);
  }
});

//get a user's requests by id and status
router.get("/threads/:status/:id", isAuth, async (req, res) => {
  const userId = req.params.id;
  const status = req.params.status;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("invalidUserIdError");
    }
    const requests = await getRequestThreads(userId, status);
    const reviews = await getReviewThreads(userId, status);
    const assigned = await getAssignedThreads(userId);

    return res.status(200).json({
      success: true,
      requests: requests,
      reviews: reviews,
      assigned: assigned
    });
  } catch (err) {
    console.log(err);
    if (err.message === "invalidUserIdError") {
      return res.status(404).json({
        errors: [
          {
            value: req.params.id,
            msg: "User not found",
            param: "id"
          }
        ]
      });
    } else if (err === "invalidStatusError") {
      return res.status(404).json({
        errors: [
          {
            value: req.params.status,
            msg: "Invalid status parameter",
            param: "status"
          }
        ]
      });
    }
    return res.sendStatus(500);
  }
});

// Route used for testing
router.get("/user/:id/assigned", isAuth, async (req, res) => {
  const assigned = await getAssignedThreads(req.params.id);
  return res.status(200).json({
    assigned: assigned
  });
});

//Save an edited post
router.put("/thread/:threadId/post/:postId", isAuth, async (req, res) => {
  const newData = req.body.content;
  try {
    const thread = await Thread.findOneAndUpdate(
      { _id: req.params.threadId, "posts._id": req.params.postId },
      {
        $set: {
          "posts.$.data": newData
        }
      }
    );
    if (thread) {
      return res.status(200).json({
        success: true
      });
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Add or update a thread rating
router.put("/thread/:threadId/rating/:rating", async (req, res) => {
  const rating = req.params.rating;
  const threadId = req.params.threadId;
  try {
    const updatedThread = await setRating(threadId, rating);
    if (updatedThread) {
      createNotification({
        recipient: updatedThread.reviewer,
        event: 5,
        origin: updatedThread.creator,
        thread: threadId
      });
      return res.status(200).json({
        success: true
      });
    } else throw new Error();
  } catch (err) {
    console.error(err);
    if (err.message === "Invalide rating value") {
      return res.status(400).json({
        success: false,
        errors: { msg: err.message }
      });
    }
    return res.sendStatus(500);
  }
});

module.exports = router;
