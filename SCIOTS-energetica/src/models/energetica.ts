import mongoose from "mongoose";

const energeticaSchema = new mongoose.Schema({
  c: { type: String, required: true },
});

export interface IEnergetica extends mongoose.Document {
  c: string;
}

export default mongoose.model("Energetica", energeticaSchema);