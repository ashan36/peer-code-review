const passport = require("passport");

const config = {
  constants: {
    notificationExpiry: 15552000
  },
  db: {
    connectionString: process.env.MONGO_URI_DEV
  },
  jwt: {
    secret: process.env.SECRET,
    tokenExpirationPolicy: "31536000" //one year in seconds
  },
  server: {
    availableLanguages: ["C", "C++", "Java", "JavaScript", "Python", "Ruby"],
    threadStatus: ["new", "assigned", "ongoing", "complete", "archived"],
    notificationEvents: [
      "new-review",
      "new-assignment",
      "new-post-by-OP",
      "new-post-by-reviewer",
      "new-rating"
    ],
    assignmentTimeout: 86400000, // 30 seconds for testing
    isAuth: passport.authenticate("jwt", { session: false })
  },
  stripe: {
    stripeSecret: process.env.STRIPE_SECRET_KEY
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretKey: process.env.AWS_SECRET,
    bucketName: "peer-code"
  }
};

module.exports = config;
