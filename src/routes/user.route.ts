import { Router } from "express";
import {
  getMe,
  login,
  refreshToken,
  resetPassword,
  sendOtp,
  updatePassword,
  updateUser,
  verifyOtp,
} from "@controllers/user.controller";
import checkAuth from "@utils/checkAuth";

export const userRouter: Router = Router();

userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/login", login);
userRouter.get("/refresh-token", refreshToken);
userRouter.get("/me", checkAuth, getMe);
userRouter.put("/", checkAuth, updateUser);
userRouter.post("/reset-password", resetPassword);
userRouter.patch("/update-password", checkAuth, updatePassword);
