import { Router } from "express";
const router = Router();

import { transferPoint } from "../controllers/userPoint.controller.js";
import { authorisedRoles, isLoggedIn } from "../middleware/auth.middleware.js";

router.post("/transfer", isLoggedIn, transferPoint);

export default router;
