import mongoose, { Schema, Document } from "mongoose";

export interface Subcategory extends Document {
  name: string;
  categoryId: string;
}

const SubcategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
});

export default mongoose.model<Subcategory>("Subcategory", SubcategorySchema);
