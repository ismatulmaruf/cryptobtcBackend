import { Schema, model } from "mongoose";

const codeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Ensuring uniqueness
      length: 6,
    },
    used: {
      type: Boolean,
      default: false, // Code will not be used initially
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the user model, assuming the user ID will be saved here
      default: null, // Initially no user has used the code
    },
  },
  {
    timestamps: true,
  }
);

export default model("Code", codeSchema);
