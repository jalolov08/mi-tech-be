import express, { Router } from "express";
import { login, register, sendOtp } from "../controllers/user.controller";
export const userRouter: Router = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/send-otp", sendOtp);

