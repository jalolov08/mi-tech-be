import { Router } from "express";
import { userRouter } from "./user.route";

export const router: Router = Router();

router.use("/user", userRouter);
