const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    authorName: {
      type: String,
      ref: "User",
      required: true
    },
    data: Schema.Types.Mixed
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);

module.exports = { Post, postSchema };
