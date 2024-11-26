import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

const addPoint = async (req, res, next) => {
  try {
    // Extract userEmail and pointsToAdd from the request body
    const { userEmail, pointsToAdd } = req.body;

    if (!userEmail || !pointsToAdd) {
      return res.status(400).json({
        success: false,
        message: "User email and points to add are required.",
      });
    }

    // Find the user by email
    const user = await userModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update the user's points
    user.point = (user.point || 0) + pointsToAdd; // Add points to the existing points
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Points added successfully.",
      user,
    });
  } catch (error) {
    console.error("Error in addPoint:", error);
    next(error); // Pass the error to the global error handler
  }
};

const transferPoint = async (req, res, next) => {
  try {
    const { recipientEmail, points } = req.body;
    const senderEmail = req.user.email; // Extract sender email from isLoggedIn middleware
    console.log(recipientEmail, points, senderEmail);

    // Validate input
    if (!recipientEmail || points === undefined) {
      return next(
        new AppError("Both recipientEmail and points are required", 400)
      );
    }

    if (senderEmail === recipientEmail) {
      return next(new AppError("Sender and recipient cannot be the same", 400));
    }

    if (typeof points !== "number" || points <= 0) {
      return next(new AppError("Points must be a positive number", 400));
    }

    // Fetch sender details
    const sender = await userModel.findOne({ email: senderEmail });
    if (!sender) {
      return next(new AppError("Sender not found", 404));
    }

    // Check if sender has sufficient points
    if (sender.point < points) {
      return next(new AppError("Insufficient points", 400));
    }

    // Fetch recipient details
    const recipient = await userModel.findOne({ email: recipientEmail });
    console.log(recipient);
    if (recipient == null) {
      return next(new AppError("Recipient not found", 404));
    }

    // Update points for sender and recipient
    sender.point -= points;
    recipient.point += points;

    // Save changes
    await sender.save();
    await recipient.save();

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${points} points to ${recipientEmail}`,
      data: {
        sender: {
          email: sender.email,
          point: sender.point,
        },
        recipient: {
          email: recipient.email,
          point: recipient.point,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("An error occurred during point transfer", 500));
  }
};

export { transferPoint };
