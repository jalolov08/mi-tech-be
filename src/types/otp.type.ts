import { Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  password: string;
  verificationAttempts: number;
  updatedAt: Date;
}
