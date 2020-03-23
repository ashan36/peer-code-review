const { Schema, model } = require("mongoose");
const { postSchema } = require("./Post");

const threadSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      default: 0,
      required: true
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    language: {
      name: String,
      experience: Number
    },
    posts: [postSchema],
    noAssign: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = model("Thread", threadSchema);
