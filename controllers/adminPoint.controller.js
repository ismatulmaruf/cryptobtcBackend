import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

const addPoint = async (req, res, next) => {
  try {
    let { email, points } = req.body;

    points = Number(points);

    console.log(points);

    // Check if email and points are provided
    if (!email || points === undefined) {
      return next(new AppError("Both email and points are required", 400));
    }

    // Validate points input
    if (typeof points !== "number" || points <= 0) {
      return next(new AppError("Points must be a positive number", 400));
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Update user points
    user.point += points;

    // Save changes to the database
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ${points} points to ${email}`,
      user: {
        fullName: user.fullName,
        email: user.email,
        point: user.point,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const removePoint = async (req, res, next) => {
  try {
    let { email, points } = req.body;

    points = Number(points);

    // Check if email and points are provided
    if (!email || points === undefined) {
      return next(new AppError("Both email and points are required", 400));
    }

    // Validate points input
    if (typeof points !== "number" || points <= 0) {
      return next(new AppError("Points must be a positive number", 400));
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if the user has enough points to deduct
    if (user.point < points) {
      return next(new AppError("Insufficient points to remove", 400));
    }

    // Deduct points from user
    user.point -= points;

    // Save changes to the database
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully removed ${points} points from ${email}`,
      user: {
        fullName: user.fullName,
        email: user.email,
        point: user.point,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export { addPoint, removePoint };
