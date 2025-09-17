import { Router } from "express";
const router = Router();

import {
  depositFormSubmit,
  updateDepositStatus,
  deleteDepositForm,
  getAllDeposits,
} from "../controllers/deposit.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

// Deposit-related routes
router.get(
  "/deposit",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  getAllDeposits
); // Submit a deposit form
router.post("/deposit", isLoggedIn, depositFormSubmit); // Submit a deposit form
router.post(
  "/deposit/:transactionId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  updateDepositStatus
); // Update deposit status
router.delete(
  "/deposit/:transactionId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  deleteDepositForm
); // Delete deposit form

export default router;
