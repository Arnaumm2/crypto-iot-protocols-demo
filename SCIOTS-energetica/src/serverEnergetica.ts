import express from "express";
import dotenv from "dotenv";
import energeticaRoutes from "./routes/energetica.js";
import { publicKey,privateKey, publicKeyJson, privateKeyJson } from "./generateKeys.js";
import mongoose from "mongoose";

dotenv.config({ quiet: true });

const app = express();
const port = 3000;

app.use(express.json());

// Rutas Rest
app.use("/", energeticaRoutes);

app.get("/pubKey", (_req,res) => {
  res.json({ n: publicKeyJson.n, e: publicKeyJson.e });
});
//Rutas de prueba

app.get("/", (_req,res) => {
  res.send(("welcome to the PD G3 Backend!"));
})
app.post("/", (_req,res) => {
  res.send(("good post to the PD G3 Backend!"));
})

mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SCIOTS-Energetica')
    .then(() => console.log('Connected to DB'))
    .catch((error) => console.error('DB Connection Error:', error));
    
app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});