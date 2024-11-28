import { Schema, model } from "mongoose";

const depositSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Usdt is required"],
      min: [0, "Usdt must be a positive number"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
    },
    deposited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

export default model("Deposit", depositSchema);
