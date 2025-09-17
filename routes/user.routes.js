import { Router } from "express";

const router = Router();
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
  getAllUsers,
  addSubscription,
  makeAdorIN,
  removeSubscription,
  deleteUserAdmin,
  getAllUserswithResult,
  getPoint,
} from "../controllers/user.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);
router.get("/point", isLoggedIn, getPoint);
router.get("/all", isLoggedIn, authorisedRoles("ADMIN", "SADMIN"), getAllUsers);
router.get(
  "/allwithresult",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  getAllUserswithResult
);
router.post(
  "/addsubscription/:userId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  addSubscription
);
router.delete(
  "/addsubscription/:userId",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  removeSubscription
);

router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/change-password", isLoggedIn, changePassword);
router.post("/update/:id", isLoggedIn, updateUser);

router.put(
  "/:id/update-role",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  makeAdorIN
);

router.delete(
  "/:id/delete-user",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  deleteUserAdmin
);

export default router;
