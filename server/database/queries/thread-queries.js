const Thread = require("../models/Thread");
const User = require("../models/User");

module.exports = {
  // Get requests that aren't archived
  getAllUserRequests: async userId => {
    const results = await Thread.find(
      { creator: userId, status: { $lt: 4 } },
      null,
      {
        sort: { updatedAt: -1 }
      }
    );
    return results;
  },

  // Get requests that aren't complete
  getOpenUserRequests: async userId => {
    const results = await Thread.find(
      { creator: userId, status: { $lt: 3 } },
      null,
      {
        sort: { updatedAt: -1 }
      }
    );
    return results;
  },

  // Get reviews that aren't archived
  getAllUserReviews: async userId => {
    const results = await Thread.find(
      { reviewer: userId, status: { $lt: 4 } },
      null,
      {
        sort: { updatedAt: -1 }
      }
    );
    return results;
  },

  // Get reviews that aren't complete
  getOpenUserReviews: async userId => {
    const results = await Thread.find(
      { reviewer: userId, status: { $lt: 3 } },
      null,
      {
        sort: { updatedAt: -1 }
      }
    );
    return results;
  },

  getAssignedThreads: async userId => {
    const results = await User.findOne({ _id: userId }, "assignedThreads")
      .populate({
        path: "assignedThreads"
      })
      .exec();
    return results;
  }
};
