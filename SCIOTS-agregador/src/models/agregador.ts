import mongoose from "mongoose";

const agregadorSchema = new mongoose.Schema({
  c: { type: String, required: true },
});

export interface IAgregador extends mongoose.Document {
  c: string;
}

export default mongoose.model("Agregador", agregadorSchema);