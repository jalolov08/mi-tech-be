import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  surname: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
}
