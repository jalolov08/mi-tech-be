import express, { Router } from "express";
import { userRouter } from "./user.routes";

export const router: Router = express.Router();
router.use("/user", userRouter);
