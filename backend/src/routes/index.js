import express from "express";
// import authRoutes from "./authRoutes.js";
import flowRoutes from "./flowRoutes.js";
// import analyticsRoutes from "./analyticsRoutes.js";

const router = express.Router();

// Define all routes here
// router.use("/auth", authRoutes);
// router.use("/analytics", analyticsRoutes);
router.use("/flows", flowRoutes);


export default router;
