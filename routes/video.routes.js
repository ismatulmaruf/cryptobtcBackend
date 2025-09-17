import { Router } from "express";
import {
  addVideo,
  getAllVideos,
  getSingleVideo,
  editVideo,
  deleteVideo,
  trackVideoProgress,
} from "../controllers/subscription.controller.js"; // Still using same controller

import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Create a new video
router.post("/", isLoggedIn, authorisedRoles("ADMIN", "SADMIN"), addVideo);

// Get all videos
router.get("/", isLoggedIn, getAllVideos);

// Get a single video
router.get("/:id", isLoggedIn, getSingleVideo);

// Update a video
router.put("/:id", isLoggedIn, authorisedRoles("ADMIN", "SADMIN"), editVideo);

// Delete a video
router.delete(
  "/:id",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  deleteVideo
);

router.post("/add-point", isLoggedIn, trackVideoProgress);

export default router;
