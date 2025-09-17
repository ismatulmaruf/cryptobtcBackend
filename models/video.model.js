import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  link: {
    type: String,
    required: [true, "Video link is required"],
  },
  point: {
    type: Number,
    required: [true, "Point is required"],
  },
  time: {
    type: Number, // time in seconds or minutes
    required: [true, "Time is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Video", videoSchema);
