import Otp from "@models/otp.model";
import { validateEmail } from "@utils/emailValidator";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "@models/user.model";
import { generateToken } from "@utils/generateToken";
import Token from "@models/token.model";
import { validateRefresh } from "@utils/validateRefresh";
import { generateRandomPassword } from "@utils/generateRandomPassword";

export async function sendOtp(req: Request, res: Response) {
  const { email, password } = req.body;

  const emailValidationResult = validateEmail(email);

  if (emailValidationResult !== true) {
    res.status(400).json(emailValidationResult);
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Пожалуйста предоставьте пароль." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Пароль должен быть не менее 8 символов." });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "Пользователь с такой почтой уже существует" });
      return;
    }

    let otp = await Otp.findOne({ email });
    if (!otp) {
      otp = new Otp({ email });
    }
    if (otp.verificationAttempts >= 5) {
      const timeElapsed: number =
        (new Date().getTime() - otp.updatedAt.getTime()) / (1000 * 60);
      if (timeElapsed < 30) {
        res.status(400).json({
          error: `Превышено ограничение на количество попыток верификации. Повторите попытку через 30 минут`,
        });
        return;
      } else {
        otp.verificationAttempts = 0;
      }
    }

    const code = "1111";
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(code, salt);
    const hashedPassword = await bcrypt.hash(password, salt);

    otp.code = hashedCode;
    otp.password = hashedPassword;
    await otp.save();

    res.status(200).json({ message: "OTP отправлен на вашу почту." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ошибка при отправке OTP. Попробуйте снова." });
  }
}
export async function verifyOtp(req: Request, res: Response) {
  const { code, email } = req.body;

  if (!code || !email) {
    res.status(400).json({ error: "Заполните все поля." });
    return;
  }

  const emailValidationResult = validateEmail(email);
  if (emailValidationResult !== true) {
    res.status(400).json({ error: "Некорректный email." });
    return;
  }

  try {
    const otp = await Otp.findOne({ email });
    if (!otp || otp.verificationAttempts >= 5) {
      res.status(400).json({
        error:
          "Превышено ограничение на количество попыток верификации или указан неверный номер телефона",
      });
      return;
    }

    if (!(await bcrypt.compare(code, otp.code))) {
      otp.verificationAttempts += 1;
      await otp.save();
      res.status(400).json({ error: "Неверный код" });
      return;
    }

    await Otp.deleteOne({ email });

    const user = await User.create({
      email,
      password: otp.password,
    });

    const token = generateToken(user, "access");
    const refreshToken = generateToken(user, "refresh");

    await Token.create({
      userId: user._id,
      refreshToken,
    });

    res
      .status(200)
      .json({ message: "Успешная верифиция", user, token, refreshToken });
  } catch (error) {
    console.error("Ошибка при верификации OTP:", error);
    res
      .status(500)
      .json({ error: "Ошибка при верификации OTP.Попробуйте снова." });
  }
}
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Заполните все поля." });
    return;
  }

  const emailValidationResult = validateEmail(email);

  if (emailValidationResult !== true) {
    res.status(400).json(emailValidationResult);
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Пароль должен быть не менее 8 символов." });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Пользователь не найден" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Неверный пароль" });
      return;
    }

    const token = generateToken(user, "access");
    const refreshToken = generateToken(user, "refresh");

    await Token.findOneAndUpdate(
      { userId: user._id },
      { refreshToken },
      { upsert: true }
    );

    res
      .status(200)
      .json({ message: "Успешный вход", user, token, refreshToken });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({ error: "Ошибка при входе. Попробуйте снова." });
  }
}
export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.query.refreshToken as string;

  try {
    const { existingToken, user } = await validateRefresh(refreshToken);

    const newToken = generateToken(user, "access");
    const newRefreshToken = generateToken(user, "refresh");

    existingToken.refreshToken = newRefreshToken;
    await existingToken.save();

    res.status(200).json({
      message: "Токены обновлены успешно",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    console.error("Ошибка обновления токена:", error);
    res.status(500).json({ error: error.message || "Ошибка сервера" });
  }
}
export async function getMe(req: Request, res: Response) {
  const userId = req.user?._id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(400).json({ error: "Пользователь не найден" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Ошибка при получение данных юзера:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получение данных юзера. Попробуйте снова." });
  }
}
export async function updateUser(req: Request, res: Response) {
  const userId = req.user?._id;
  const { name, surname, birthDate, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          surname,
          birthDate,
          phone,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Профиль успешно обновлен.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Ошибка при обновленые данных юзера:", error);
    res
      .status(500)
      .json({ error: "Ошибка при обновленые данных юзера. Попробуйте снова." });
  }
}
export async function resetPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Пожалуйста, укажите email." });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(400)
        .json({ message: "Пользователь с такой почтой не существует" });
      return;
    }

    const newPassword = generateRandomPassword();
    console.log("newPassword", newPassword);

    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Новый пароль отправлен на вашу почту." });
  } catch (error) {
    console.error("Ошибка при отправке нового пароля:", error);
    res
      .status(500)
      .json({ error: "Ошибка при отправке нового пароля. Попробуйте снова." });
  }
}
export async function updatePassword(req: Request, res: Response) {
  const userId = req.user?._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res
      .status(400)
      .json({ error: "Пожалуйста, укажите текущий и новый пароль." });
    return;
  }

  if (newPassword.length < 8) {
    res
      .status(400)
      .json({ error: "Новый пароль должен содержать хотя бы 8 символов." });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден." });
      return;
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      res.status(400).json({ error: "Неверный текущий пароль." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Пароль успешно обновлен." });
  } catch (error) {
    console.error("Ошибка при обновлении пароля:", error);
    res
      .status(500)
      .json({ error: "Ошибка при обновлении пароля. Попробуйте снова." });
  }
}
