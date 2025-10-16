import { Router } from "express";
const router = Router();

import {
  withdrawFormSubmit,
  updateWithdrawStatus,
  deleteWithdrawForm,
  getAllWithdrawals,
  getMyWithdrawals,
} from "../controllers/withdraw.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

// Deposit-related routes
router.get(
  "/",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  getAllWithdrawals
);
router.post("/", isLoggedIn, withdrawFormSubmit); // Submit a deposit form
router.post(
  "/:paymentId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  updateWithdrawStatus
); // Update deposit status
router.delete(
  "/:paymentId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  deleteWithdrawForm
); // Delete deposit form

// User withdrawal history
router.get("/my-withdrawals", isLoggedIn, getMyWithdrawals);

export default router;
