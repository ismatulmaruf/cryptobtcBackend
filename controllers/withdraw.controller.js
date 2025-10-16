import Withdraw from "../models/withdraw.model.js";
import AppError from "../utils/error.utils.js";

// Submit a withdrawal request
const withdrawFormSubmit = async (req, res, next) => {
  try {
    let { amount, paymentId } = req.body;
    const email = req.user.email;

    amount = Number(amount);

    // Validate input
    if (!email || !amount || !paymentId) {
      return next(
        new AppError("Email, amount, and payment ID are required", 400)
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return next(new AppError("Amount must be a positive number", 400));
    }

    // Check for duplicate payment ID
    const existingWithdraw = await Withdraw.findOne({ paymentId });
    if (existingWithdraw) {
      return next(new AppError("Payment ID already exists", 400));
    }

    // Create a new withdrawal request
    const withdraw = await Withdraw.create({
      email,
      amount,
      paymentId,
      withdrawed: false, // Default status
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdraw,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to submit withdrawal request", 500));
  }
};

// Get all withdrawal requests
const getAllWithdrawals = async (req, res, next) => {
  try {
    // Optional query parameters for filtering, pagination, and sorting
    const {
      email,
      withdrawed,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    // Build query object
    const query = {};
    if (email) query.email = email;
    if (withdrawed !== undefined) query.withdrawed = withdrawed === "true";

    // Pagination settings
    const skip = (page - 1) * limit;

    // Retrieve withdrawals with filters, sorting, and pagination
    const withdrawals = await Withdraw.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Total count for pagination metadata
    const total = await Withdraw.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Withdrawals retrieved successfully",
      withdrawals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to retrieve withdrawals", 500));
  }
};

// Delete a withdrawal request
const deleteWithdrawForm = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Check if payment ID is provided
    if (!paymentId) {
      return next(new AppError("Payment ID is required", 400));
    }

    // Find and delete the withdrawal request
    const deletedWithdraw = await Withdraw.findOneAndDelete({ paymentId });
    if (!deletedWithdraw) {
      return next(new AppError("Withdrawal request not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal request deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to delete withdrawal request", 500));
  }
};

// Update the withdrawal status
const updateWithdrawStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    console.log(paymentId);

    // Validate input
    if (!paymentId) {
      return next(new AppError("Payment ID is required", 400));
    }

    // Find the withdrawal request
    const withdraw = await Withdraw.findOne({ paymentId });
    if (!withdraw) {
      return next(new AppError("Withdrawal request not found", 404));
    }

    // Toggle withdrawal status
    withdraw.withdrawed = !withdraw.withdrawed;
    await withdraw.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal status updated successfully.`,
      withdrawed: withdraw.withdrawed,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to update withdrawal status", 500));
  }
};

// Get all withdrawals for logged-in user
const getMyWithdrawals = async (req, res, next) => {
  try {
    const email = req.user.email;

    if (!email) {
      return next(new AppError("User email not found", 400));
    }

    const withdrawals = await Withdraw.find({ email }).sort("-createdAt");

    res.status(200).json({
      success: true,
      message: "Your withdrawal history retrieved successfully",
      withdrawals,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Failed to retrieve withdrawal history", 500));
  }
};

export {
  withdrawFormSubmit,
  deleteWithdrawForm,
  updateWithdrawStatus,
  getAllWithdrawals,
  getMyWithdrawals,
};
