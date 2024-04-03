import mongoose from "mongoose";
import { MONGODB_URI, PORT } from "./config";
import express from "express";
import { router } from "./routes";

const app = express();
mongoose
  .connect(MONGODB_URI, {})
  .then(() => {
    console.log("Успешно Подключено к MongoDB");
  })
  .catch((error) => {
    console.error("Ошибка при подключение к MongoDB:", error);
  });

app.use(express.json());

app.use(router);
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
