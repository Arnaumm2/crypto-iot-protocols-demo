import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import agregadorRoutes from "./routes/agregador.js";
import {publicKey,privateKey,publicKeyJson,privateKeyJson} from "./generateKeys.js";
import { RsaPublicKey } from "./rsa.js";

dotenv.config({ quiet: true });

const app = express();
const port = 3001;

app.use(express.json());

// Rutas Rest
app.use("/", agregadorRoutes);

//Rutas de prueba
app.get("/", (_req,res) => {
  res.send(("welcome to the PD G3 Backend!"));
})
app.post("/", (_req,res) => {
  res.send(("good post to the PD G3 Backend!"));
})


mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SCIOTS-Agregador')
    .then(() => console.log('Connected to DB'))
    .catch((error) => console.error('DB Connection Error:', error));

app.listen(port, () => {
  console.log(`DroneApp API listening at http://localhost:${port}`);
});

