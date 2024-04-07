import { Request, Response } from "express";
import subcategoryModel from "../models/subcategory.model";

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({
        message:
          "Доступ запрещен. Только администратор может создавать подкатегории.",
      });
    }
    const { name, categoryId } = req.body;
    const subcategory = new subcategoryModel({ name, categoryId });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSubcategories = async (req: Request, res: Response) => {
  try {
    const subcategories = await subcategoryModel.find();
    res.status(200).json(subcategories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({
        message:
          "Доступ запрещен. Только администратор может удалять подкатегории.",
      });
    }

    const subcategoryId = req.params.id;
    const subcategory = await subcategoryModel.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ message: "Подкатегория не найдена." });
    }

    await subcategoryModel.deleteOne({ _id: subcategoryId });
    res.status(200).json({ message: "Подкатегория успешно удалена." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getSubcategoriesByCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const categoryId = req.params.id;
    const subcategories = await subcategoryModel.find({ categoryId });
    res.status(200).json(subcategories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
