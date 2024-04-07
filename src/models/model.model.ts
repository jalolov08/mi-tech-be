import mongoose, { Schema, Document } from "mongoose";

export interface Model extends Document {
  name: string;
  subcategoryId: string;
}

const ModelSchema: Schema = new Schema({
  name: { type: String, required: true },
  subcategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory', required: true },
});

export default mongoose.model<Model>("Model", ModelSchema);
