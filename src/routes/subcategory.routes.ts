import express, { Router } from "express";
import {
  createSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getSubcategoriesByCategoryId,
} from "../controllers/subcategory.controller";
import checkAuth from "../utils/checkAuth";
import {
  createModel,
  deleteModel,
  getModelsBySubcategoryId,
} from "../controllers/model.controller";
export const subcategoryRouter: Router = express.Router();

subcategoryRouter.get("/all", getAllSubcategories);
subcategoryRouter.get("/:id", getSubcategoriesByCategoryId);
subcategoryRouter.post("/new", checkAuth, createSubcategory);
subcategoryRouter.delete("/:id/delete", checkAuth, deleteSubcategory);

subcategoryRouter.get("/:id/models", getModelsBySubcategoryId);
subcategoryRouter.post("/:id/model/new", checkAuth, createModel);
subcategoryRouter.delete("/:id/model/delete", checkAuth, deleteModel);
