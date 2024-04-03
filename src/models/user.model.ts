import mongoose, { Schema } from "mongoose";
import { User } from "../types/user.type";

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    name: { type: String, required: true },
    surname: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
