import express from "express";
const router = express.Router();

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";

router.use("/api/users", userRoutes);
router.use("/api/auth", authRoutes);


export default router;
