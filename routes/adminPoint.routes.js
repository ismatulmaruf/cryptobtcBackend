import { Router } from "express";
const router = Router();

import { addPoint, removePoint } from "../controllers/adminPoint.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

router.post(
  "/addpoint",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  addPoint
);
router.post(
  "/removepoint",
  isLoggedIn,
  authorisedRoles("ADMIN", "SADMIN"),
  removePoint
);

export default router;
