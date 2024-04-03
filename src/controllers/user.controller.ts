import { Request, Response } from "express";
import UserModel from "../models/user.model";
import OtpModel from "../models/otp.model";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, phone, address, name, surname, code } = req.body;

    if (
      !email ||
      !password ||
      !phone ||
      !address ||
      !name ||
      !surname ||
      !code
    ) {
      return res.status(400).json({
        success: false,
        message: "Все поля обязательны для заполнения",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Неверный формат электронной почты",
      });
    }

    const checkUser = await UserModel.findOne({ email });
    if (checkUser) {
      return res.status(401).json({
        success: false,
        message: "Пользователь уже зарегистрирован",
      });
    }

    const otpCheck = await OtpModel.findOne({ email, code });
    if (!otpCheck) {
      return res.status(401).json({
        success: false,
        message: "Неверный OTP-код",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      phone,
      address,
      name,
      surname,
    });

    await newUser.save();

    await OtpModel.deleteOne({ email, code });
    const token = jwt.sign(
      { email: newUser.email, userId: newUser._id },
      JWT_SECRET,
      { expiresIn: "1y" }
    );
    res.status(200).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      token,
      user: {
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        name: newUser.name,
        surname: newUser.surname,
      },
    });
  } catch (error) {
    console.error("Ошибка регистрации пользователя:", error);
    return res
      .status(500)
      .json({ success: false, error: "Внутренняя ошибка сервера" });
  }
}

export async function sendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Требуется электронная почта",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Неверный формат электронной почты",
      });
    }

    const checkUser = await UserModel.findOne({ email });
    if (checkUser) {
      return res.status(401).json({
        success: false,
        message: "Пользователь уже зарегистрирован",
      });
    }

    const code = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(code);

    const newOtp = await OtpModel.create({ email, code });
    res.status(200).json({
      success: true,
      message: "КОД успешно отправлен",
    });
  } catch (error) {
    console.error("Ошибка отправки OTP:", error);
    return res
      .status(500)
      .json({ success: false, error: "Внутренняя ошибка сервера" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Требуется адрес электронной почты и пароль",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неправильный адрес электронной почты или пароль",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Неправильный адрес электронной почты или пароль",
      });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      JWT_SECRET,
      { expiresIn: "1y" }
    );

    res.status(200).json({
      success: true,
      message: "Авторизация успешна",
      token,
      user: {
        email: user.email,
        phone: user.phone,
        address: user.address,
        name: user.name,
        surname: user.surname,
      },
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    return res
      .status(500)
      .json({ success: false, error: "Внутренняя ошибка сервера" });
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
}
