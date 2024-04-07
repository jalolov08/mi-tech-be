import { Request, Response } from "express";
import modelModel from "../models/model.model";

export const getModelsBySubcategoryId = async (req: Request, res: Response) => {
  try {
    const subcategoryId = req.params.id;
    const models = await modelModel.find({ subcategoryId });
    res.status(200).json(models);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createModel = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({
        message:
          "Доступ запрещен. Только администратор может создавать модели.",
      });
    }

    const { name } = req.body;
    const subcategoryId = req.params.id;
    const newModel = new modelModel({ name, subcategoryId });
    await newModel.save();
    res.status(201).json(newModel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({
        message: "Доступ запрещен. Только администратор может удалять модели.",
      });
    }

    const modelId = req.params.id;
    await modelModel.findByIdAndDelete(modelId);
    res.status(200).json({ message: "Модель успешно удалена" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
