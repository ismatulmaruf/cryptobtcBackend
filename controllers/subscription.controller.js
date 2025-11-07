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
// const trackVideoProgress = async (req, res, next) => {
//   try {
//     const { videoId, point } = req.body;

//     if (!videoId || !point) {
//       return next(new AppError("Video ID and point are required", 400));
//     }

//     const user = await User.findById(req.user.id);
//     const video = await Video.findById(videoId);

//     if (!user || !video) {
//       return next(new AppError("User or video not found", 404));
//     }

//     // Check if user has at least 12 points to be eligible for video points
//     if (user.point < 12) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "You need at least 12 points to earn points from watching videos.",
//         totalPoints: user.point,
//       });
//     }

//     // Check if video was already watched today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // start of today

//     const alreadyWatchedToday = user.watchedVideos.some((item) => {
//       return (
//         item.video.toString() === videoId.toString() &&
//         new Date(item.watchedAt) >= today
//       );
//     });

//     if (alreadyWatchedToday) {
//       return res.status(200).json({
//         success: false,
//         message:
//           "You’ve already watched this video today — no extra points this time! 😊",
//         totalPoints: user.point,
//       });
//     }

//     // ✅ Add points for the user
//     user.point += point;
//     user.watchedVideos.push({ video: videoId, watchedAt: new Date() });

//     // ✅ Referral bonus (10% of user's earned points)
//     // if (user.referredBy) {
//     //   // Find user whose email starts with referredBy + '@'
//     //   const referredUser = await User.findOne({
//     //     email: { $regex: `^${user.referredBy}@`, $options: "i" },
//     //   });

//     //   console.log(referredUser);

//     //   if (referredUser) {
//     //     const referralBonus = Math.floor(point * 0.1); // 10%
//     //     referredUser.point += referralBonus;
//     //     await referredUser.save();
//     //   }
//     // }

//     // if (user.referredBy) {
//     //   // console.log("Looking for referrer with email starting:", user.referredBy);

//     //   // Find the referrer by matching email prefix (case-insensitive)
//     //   const referredUser = await User.findOne({
//     //     email: { $regex: `^${user.referredBy}@`, $options: "i" },
//     //   });

//     //   if (referredUser) {
//     //     // Calculate 10% referral bonus, rounded to 3 decimal places
//     //     const referralBonus = Math.round(point * 0.1 * 1000) / 1000;

//     //     // console.log(point);
//     //     // console.log(
//     //     // `✅ Referrer found: ${referredUser.email}, adding ${referralBonus} points`
//     //     // );

//     //     // Use $inc to update points atomically
//     //     await User.updateOne(
//     //       { _id: referredUser._id },
//     //       { $inc: { point: referralBonus } }
//     //     );

//     //     // console.log("💾 Referrer points updated successfully");
//     //   } else {
//     //     // console.log("❌ No referrer found for", user.referredBy);
//     //   }
//     // }

//     // ✅ Referral bonus system (3 levels: father, grandfather, great-grandfather)
//     if (user.referredBy) {
//       // Helper function to find user by referredBy prefix
//       const findReferrer = async (referredByPrefix) => {
//         return await User.findOne({
//           email: { $regex: `^${referredByPrefix}@`, $options: "i" },
//         });
//       };

//       // Level 1: Father (direct referrer)
//       const level1 = await findReferrer(user.referredBy);
//       if (level1) {
//         const level1Bonus = Math.round(point * 0.1 * 1000) / 1000;
//         await User.updateOne(
//           { _id: level1._id },
//           { $inc: { point: level1Bonus } }
//         );

//         // Level 2: Grandfather (referrer of level1)
//         if (level1.referredBy) {
//           const level2 = await findReferrer(level1.referredBy);
//           if (level2) {
//             const level2Bonus = Math.round(point * 0.05 * 1000) / 1000;
//             await User.updateOne(
//               { _id: level2._id },
//               { $inc: { point: level2Bonus } }
//             );

//             // Level 3: Great-grandfather (referrer of level2)
//             if (level2.referredBy) {
//               const level3 = await findReferrer(level2.referredBy);
//               if (level3) {
//                 const level3Bonus = Math.round(point * 0.03 * 1000) / 1000;
//                 await User.updateOne(
//                   { _id: level3._id },
//                   { $inc: { point: level3Bonus } }
//                 );
//               }
//             }
//           }
//         }
//       }
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: `🎉 Great progress! You've earned ${point} points for watching this video.`,
//       totalPoints: user.point,
//     });
//   } catch (error) {
//     console.error("Error tracking video progress:", error);
//     return next(new AppError("Failed to track video progress", 500));
//   }
// };

const trackVideoProgress = async (req, res, next) => {
  try {
    const { videoId, point } = req.body;

    if (!videoId || !point) {
      return next(new AppError("Video ID and point are required", 400));
    }

    const user = await User.findById(req.user.id);
    const video = await Video.findById(videoId);

    if (!user || !video) {
      return next(new AppError("User or video not found", 404));
    }

    // Check if user has at least 12 points
    if (user.point < 12) {
      return res.status(400).json({
        success: false,
        message:
          "You need at least 12 points to earn points from watching videos.",
        totalPoints: user.point,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Try atomic update: only update if not watched today
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        watchedVideos: {
          $not: {
            $elemMatch: {
              video: videoId,
              watchedAt: { $gte: today },
            },
          },
        },
      },
      {
        $inc: { point: point },
        $push: { watchedVideos: { video: videoId, watchedAt: new Date() } },
      },
      { new: true } // return updated user
    );

    // If updatedUser is null, means already watched today
    if (!updatedUser) {
      return res.status(200).json({
        success: false,
        message:
          "You’ve already watched this video today — no extra points this time! 😊",
        totalPoints: user.point,
      });
    }

    // ✅ Referral bonus system (3 levels)
    const findReferrer = async (prefix) => {
      return await User.findOne({
        email: { $regex: `^${prefix}@`, $options: "i" },
      });
    };

    if (user.referredBy) {
      const level1 = await findReferrer(user.referredBy);
      if (level1) {
        const level1Bonus = Math.round(point * 0.1 * 1000) / 1000;
        await User.updateOne(
          { _id: level1._id },
          { $inc: { point: level1Bonus } }
        );

        // console.log(level1);

        if (level1.referredBy) {
          // console.log(level1.referredBy);
          const level2 = await findReferrer(level1.referredBy);
          if (level2) {
            const level2Bonus = Math.round(point * 0.05 * 1000) / 1000;
            await User.updateOne(
              { _id: level2._id },
              { $inc: { point: level2Bonus } }
            );

            if (level2.referredBy) {
              const level3 = await findReferrer(level2.referredBy);
              if (level3) {
                const level3Bonus = Math.round(point * 0.03 * 1000) / 1000;
                await User.updateOne(
                  { _id: level3._id },
                  { $inc: { point: level3Bonus } }
                );
              }
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `🎉 Great progress! You've earned ${point} points for watching this video.`,
      totalPoints: updatedUser.point,
    });
  } catch (error) {
    console.error("Error tracking video progress:", error);
    return next(new AppError("Failed to track video progress", 500));
  }
};

// Controller to activate subscription using points
const activateSubscriptionWithPoints = async (req, res, next) => {
  try {
    // Find the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user has at least 12 points
    if (user.point < 12) {
      return next(
        new AppError(
          "Not enough points to activate subscription. Please deposit at least 12 points to activate subscription.",
          400
        )
      );
    }

    // Activate subscription (subscription is free)
    user.subscription = true;

    // Save the user
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Subscription activated successfully! You can now access all features.",
      pointsAvailable: user.point,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error activating subscription with points:", error);
    return next(new AppError("Failed to activate subscription", 500));
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
  activateSubscriptionWithPoints,
};
