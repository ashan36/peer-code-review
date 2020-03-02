const { Thread, Post, threadQueries } = require("../database");
const config = require("../config/config");

module.exports = {
  createRequest: async data => {
    const { title, content, language, user } = data;
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
      await thread.save();
    } else throw new Error("Missing required request data");
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
  }
};