const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const Thread = require("./Thread");
const { Notification } = require("./Notification");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    experience: {
      type: Schema.Types.Mixed,
      of: Number
    },
    avatar: {
      url: { type: String, default: "" },
      key: { type: String, default: "" }
    },
    assignedThreads: [{ type: Schema.Types.ObjectId, ref: Thread }],
    assignedCount: { type: Number, default: 0 },
    credits: {
      type: Number,
      default: 3
    },
    rating: {
      averageRating: {
        type: Number,
        default: 3
      },
      count: {
        type: Number,
        default: 1
      }
    }
  },
  { timestamps: true }
);

// run before every model.save() call
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// run after model.save
userSchema.pre("save", async function(next) {
  if (!this.isModified("assignedThreads")) return next();
  try {
    const count = this.assignedThreads.length;
    this.assignedCount = count;
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.method("login", async function(user, callback) {
  const payload = {
    user
  };

  jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: Number(config.jwt.tokenExpirationPolicy)
    },
    (err, token) => {
      callback(err, token);
    }
  );
});

module.exports = model("user", userSchema);
