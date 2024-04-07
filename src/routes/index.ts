import express, { Router } from "express";
import { userRouter } from "./user.routes";
import { subcategoryRouter } from "./subcategory.routes";
export const router: Router = express.Router();
router.use("/user", userRouter);
router.use("/subcategory", subcategoryRouter);
