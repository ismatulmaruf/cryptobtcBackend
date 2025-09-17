import { Router } from "express";
import {
  addUniqueCode,
  getAllCodes,
  applySubscriptionCode,
} from "../controllers/subscription.controller.js";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Route to add unique code
router.post("/add-code", isLoggedIn, authorisedRoles("SADMIN"), addUniqueCode);

// Route to get all generated codes (for ADMIN)
router.get(
  "/all-codes",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  getAllCodes
);

// Route to apply a subscription code
router.post(
  "/apply-code",
  isLoggedIn, // Ensure the user is logged in
  applySubscriptionCode
);

export default router;
