const { User, Thread } = require("../database");
const config = require("../config/config");
const { uploadPicture, deleteFile } = require("../utils/awsUpload");

module.exports = {
  setExperience: async (userId, experience) => {
    const user = await User.findById(userId);
    if (
      Object.keys(experience).every(ele =>
        config.server.availableLanguages.includes(ele)
      )
    ) {
      // Set values of languages obj to numbers
      for (let language in experience) {
        if (experience.hasOwnProperty(language)) {
          experience[language] = Number(experience[language]);
        }
      }
    }
    // Set user experience to new languages obj and save
    user.experience = experience;
    user.markModified("experience");
    user.save();
  },

  uploadAvatar: async (userId, buffer, type) => {
    try {
      const user = await User.findById(userId);
      if (user.avatar.key !== "") {
        const result = deleteFile(user.avatar.key);
        if (!result) {
          throw new Error("Failed to delete file from S3");
        }
      }
      const result = await uploadPicture(userId, buffer, type);
      user.avatar.url = result.Location;
      user.avatar.key = result.Key;
      await user.save();
      return result.Location;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  updateCredits: async (userId, amount) => {
    const user = await User.findById(userId);
    if (user.credits + amount >= 0) {
      user.credits += Number(amount);
      user.save();
      return true;
    }
    return false;
  },

  assignThread: async (userId, threadId) => {
    const user = await User.findById(userId);
    user.assignedThreads.addToSet(threadId);
    const updatedUser = await user.save();
    return updatedUser;
  },

  unassignThread: async (userId, threadId) => {
    const user = await User.findById(userId);
    user.assignedThreads.pull(threadId);
    const updatedUser = await user.save();
    return updatedUser;
  },

  editName: async (userId, reqBody) => {
    const { name, email } = reqBody;
    const user = await User.findById(userId);
    user.name = name;
    user.email = email;
    const updatedUser = await user.save();
    return updatedUser;
  },

  newRating: async (userId, rating) => {
    try {
      if (rating < 0 || rating > 5) {
        throw new Error("Invalid rating value");
      }
      const user = await User.findById(userId);
      if (user) {
        if (user.rating.count === 0) {
          user.rating.averageRating = rating;
          user.rating.count = 1;
        } else {
          let sum = user.rating.averageRating * user.rating.count;
          sum += rating;
          user.rating.count++;
          user.rating.averageRating = sum / user.rating.count;
        }
        const updatedUser = await user.save();
        return updatedUser;
      } else throw new Error("Invalid user id");
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  updateRating: async (userId, ratingDelta) => {
    try {
      if (ratingDelta < -5 || ratingDelta > 5) {
        throw new Error("Invalid rating value");
      }
      const user = await User.findById(userId);
      if (user) {
        let sum = user.rating.averageRating * user.rating.count;
        sum += Number(ratingDelta);
        user.rating.averageRating = sum / user.rating.count;
        const updatedUser = await user.save();
        return updatedUser;
      } else throw new Error("Invalid user id");
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  getUserActivity: async id => {
    const requests = await Thread.find({ creator: id });
    const reviews = await Thread.find({ reviewer: id });
    const user = await User.findById(id);

    return {
      requests: requests.length,
      reviews: reviews.length,
      rating: user.rating.averageRating
    };
  },

  getGeneralUserInfo: async users => {
    try {
      const result = await User.find({ _id: { $in: users } }, "name avatar");
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};
