import jwt from "jsonwebtoken";
import { IUser } from "types/user.type";
import { jwtSecret, jwtRefreshSecret } from "../config";

export function generateToken(
  user: IUser,
  tokenType: "access" | "refresh" = "access"
) {
  const expiresIn = tokenType === "access" ? "60m" : "60d";
  const secret = tokenType === "access" ? jwtSecret : jwtRefreshSecret;

  return jwt.sign(
    {
      _id: user._id,
    },
    secret,
    { algorithm: "HS256", expiresIn }
  );
}
