import Code from "../models/subscription.model.js";
import AppError from "../utils/error.utils.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";

// Function to generate a 6-digit unique code
const generateCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};

// Controller to create a new unique code
const addUniqueCode = async (req, res, next) => {
  try {
    // Generate a unique code
    let code = generateCode();

    // Check if the code already exists
    let existingCode = await Code.findOne({ code });

    while (existingCode) {
      // Regenerate if code already exists
      code = generateCode();
      existingCode = await Code.findOne({ code });
    }

    // Save the new code in the database
    const newCode = await Code.create({ code });

    res.status(201).json({
      success: true,
      message: "Unique code generated successfully",
      code: newCode,
    });
  } catch (e) {
    return next(new AppError("Failed to generate unique code", 500));
  }
};

// Controller to get all generated codes
const getAllCodes = async (req, res, next) => {
  try {
    // Fetch all codes from the database
    const codes = await Code.find();

    // Check if codes exist
    if (!codes || codes.length === 0) {
      return next(new AppError("No codes found", 404));
    }

    res.status(200).json({
      success: true,
      message: "All generated codes fetched successfully",
      codes,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch codes", 500));
  }
};

// Controller to apply the subscription code
const applySubscriptionCode = async (req, res, next) => {
  try {
    const { code } = req.body; // Assuming the code is sent in the request body

    // Log the incoming code for debugging
    console.log("Received code:", code);

    // Check if the code exists and is unused
    const subscriptionCode = await Code.findOne({ code, used: false });

    if (!subscriptionCode) {
      console.log("Code is invalid or already used");
      return next(new AppError("Invalid or already used code", 400));
    }

    // Find the user who is applying the code
    const user = await User.findById(req.user.id); // Assuming `req.user.id` is the logged-in user's ID

    if (!user) {
      console.log("User not found");
      return next(new AppError("User not found", 404));
    }

    // Mark the code as used and associate it with the user
    subscriptionCode.used = true;
    subscriptionCode.usedBy = user._id;
    await subscriptionCode.save();

    // Update the user's subscription status
    user.subscription = true;
    console.log("User subscription status before save:", user.subscription);

    const updatedUser = await user.save(); // Save the user

    // Log the result to ensure the user was saved correctly
    console.log("Updated user:", updatedUser);

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully with the code!",
    });
  } catch (error) {
    console.error("Error applying the code:", error);
    return next(new AppError("Failed to apply the code", 500));
  }
};

// Add a new video
const addVideo = async (req, res, next) => {
  try {
    const { link, point, time } = req.body;

    if (!link || !point || !time) {
      return next(new AppError("All fields are required", 400));
    }

    const newVideo = await Video.create({ link, point, time });

    res.status(201).json({
      success: true,
      message: "Video added successfully",
      video: newVideo,
    });
  } catch (error) {
    return next(new AppError("Failed to add video", 500));
  }
};

// Get all videos
const getAllVideos = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All videos fetched successfully",
      videos,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch videos", 500));
  }
};

// Get a single video by ID
const getSingleVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return next(new AppError("Video not found", 404));
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    return next(new AppError("Failed to get video", 500));
  }
};

// Edit a video
const editVideo = async (req, res, next) => {
  try {
    const { link, point, time } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return next(new AppError("Video not found", 404));
    }

    video.link = link || video.link;
    video.point = point ?? video.point;
    video.time = time ?? video.time;

    const updatedVideo = await video.save();

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    return next(new AppError("Failed to update video", 500));
  }
};

// Delete a video
const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return next(new AppError("Video not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    return next(new AppError("Failed to delete video", 500));
  }
};

// Track video watch progress and award points
const trackVideoProgress = async (req, res, next) => {
  try {
    const { videoId, progress, point } = req.body;

    if (!videoId || !progress || !point) {
      return next(
        new AppError("Video ID, progress, and point are required", 400)
      );
    }

    const user = await User.findById(req.user.id);
    const video = await Video.findById(videoId);

    if (!user || !video) {
      return next(new AppError("User or video not found", 404));
    }

    // Update the user's watchedVideos array and points in one atomic operation
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id, "watchedVideos.video": videoId },
      {
        $push: { "watchedVideos.$.milestones": progress },
        $inc: { point: point },
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(new AppError("Failed to update video progress", 400));
    }

    return res.status(200).json({
      success: true,
      message: `Awarded ${point} points for watching ${progress}%`,
      totalPoints: updatedUser.point,
    });
  } catch (error) {
    console.error("Error tracking video progress:", error);
    return next(new AppError("Failed to track video progress", 500));
  }
};

export {
  addUniqueCode,
  getAllCodes,
  applySubscriptionCode,
  addVideo,
  getAllVideos,
  getSingleVideo,
  editVideo,
  deleteVideo,
  trackVideoProgress,
};
