import { Router } from "express";
const router = Router();

import { addPoint, removePoint } from "../controllers/adminPoint.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

router.post("/addpoint", isLoggedIn, authorisedRoles("ADMIN"), addPoint);
router.post("/removepoint", isLoggedIn, authorisedRoles("ADMIN"), removePoint);

export default router;
