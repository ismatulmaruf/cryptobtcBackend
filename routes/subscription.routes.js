import { Router } from "express";
import {
  addUniqueCode,
  getAllCodes,
  applySubscriptionCode,
  activateSubscriptionWithPoints, // import your new controller
} from "../controllers/subscription.controller.js";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Route to add unique code
router.post("/add-code", isLoggedIn, authorisedRoles("ADMIN"), addUniqueCode);

// Route to get all generated codes (for ADMIN)
router.get(
  "/all-codes",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  getAllCodes
);

// Route to apply a subscription code
router.post("/apply-code", isLoggedIn, applySubscriptionCode);

// Route to activate subscription using points
router.post(
  "/activate-with-points",
  isLoggedIn, // Ensure the user is logged in
  activateSubscriptionWithPoints
);

export default router;
