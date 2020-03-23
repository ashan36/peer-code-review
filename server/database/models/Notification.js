const { Schema, model } = require("mongoose");
const config = require("../../config/config");

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  thread: {
    type: Schema.Types.ObjectId,
    ref: "Thread"
  },
  event: {
    type: Number
  },
  origin: {
    type: String
  },
  seen: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: config.constants.noticationExpiry }
  }
});

const Notification = model("Notification", notificationSchema);

module.exports = { Notification, notificationSchema };
