import Deposit from "../models/deposit.model.js";
import AppError from "../utils/error.utils.js";

const depositFormSubmit = async (req, res, next) => {
  try {
    const { amount, transactionId } = req.body;

    const email = req.user.email;

    // Validate input
    if (!email || !amount || !transactionId) {
      return next(
        new AppError("Email, amount, and transaction ID are required", 400)
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return next(new AppError("Amount must be a positive number", 400));
    }

    // Check for duplicate transaction ID
    const existingDeposit = await Deposit.findOne({ transactionId });
    if (existingDeposit) {
      return next(new AppError("Transaction ID already exists", 400));
    }

    // Create deposit form
    const deposit = await Deposit.create({
      email,
      amount,
      transactionId,
      deposited: false, // Default status
    });

    res.status(201).json({
      success: true,
      message: "Deposit form submitted successfully",
      deposit,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to submit deposit form", 500));
  }
};

const getAllDeposits = async (req, res, next) => {
  try {
    // Optional query parameters for filtering
    const { email, deposited } = req.query;

    // Build query object
    const query = {};
    if (email) query.email = email;
    if (deposited !== undefined) query.deposited = deposited === "true";

    // Retrieve all deposits with optional filters
    const deposits = await Deposit.find(query).sort("-createdAt");

    res.status(200).json({
      success: true,
      message: "All deposits retrieved successfully",
      deposits,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to retrieve deposits", 500));
  }
};

const deleteDepositForm = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Check if transaction ID is provided
    if (!transactionId) {
      return next(new AppError("Transaction ID is required", 400));
    }

    // Find and delete the deposit form
    const deletedDeposit = await Deposit.findOneAndDelete({ transactionId });
    if (!deletedDeposit) {
      return next(new AppError("Deposit form not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Deposit form deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to delete deposit form", 500));
  }
};

const updateDepositStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Validate input
    if (!transactionId) {
      return next(new AppError("Transaction ID is required", 400));
    }

    // Find the deposit form
    const deposit = await Deposit.findOne({ transactionId });
    if (!deposit) {
      return next(new AppError("Deposit form not found", 404));
    }

    // Toggle deposited status
    deposit.deposited = !deposit.deposited;
    await deposit.save();

    res.status(200).json({
      success: true,
      message: `Deposit status updated successfully.`,
      deposited: deposit.deposited,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to update deposit status", 500));
  }
};

const getUserDeposits = async (req, res, next) => {
  try {
    const email = req.user.email; // Logged-in user email

    if (!email) {
      return next(new AppError("User email not found", 400));
    }

    // Find all deposits by this user
    const deposits = await Deposit.find({ email }).sort("-createdAt");

    res.status(200).json({
      success: true,
      message: "Your deposit history retrieved successfully",
      deposits,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to retrieve your deposit history", 500));
  }
};

export {
  depositFormSubmit,
  deleteDepositForm,
  updateDepositStatus,
  getAllDeposits,
  getUserDeposits,
};
