import { Router } from "express";
const router = Router();

import {
  withdrawFormSubmit,
  updateWithdrawStatus,
  deleteWithdrawForm,
  getAllWithdrawals,
} from "../controllers/withdraw.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

// Deposit-related routes
router.get("/", isLoggedIn, authorisedRoles("ADMIN"), getAllWithdrawals);
router.post("/", isLoggedIn, withdrawFormSubmit); // Submit a deposit form
router.post(
  "/:paymentId",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  updateWithdrawStatus
); // Update deposit status
router.delete(
  "/:paymentId",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  deleteWithdrawForm
); // Delete deposit form

export default router;
