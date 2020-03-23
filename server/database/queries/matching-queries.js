const User = require("../models/User");

module.exports = {
  //returns an array of user_ids that fit the filter criteria.
  getCandidates: async thread => {
    const language = thread.language.name;
    const expLevel = thread.language.experience;

    /*
    1. Candidate is not this thread's noAssign list
    2. Candidate's experience level in the thread language > than the thread requester's
    3. Candidate's assignedThreads length <= 5
    */
    console.log("getting candidates");

    const results = await User.find(
      {
        _id: { $not: { $in: thread.noAssign } },
        [`experience.${language}`]: { $exists: true },
        [`experience.${language}`]: { $gt: expLevel },
        assignedCount: { $lt: 2 } // set to 2 for testing.
      },
      "_id"
    );

    console.log(results);
    return results;
  }
};
