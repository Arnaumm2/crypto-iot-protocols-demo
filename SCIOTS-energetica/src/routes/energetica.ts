import express from "express";
import { createEnergeticaHandler } from "../controllers/energetica.js";

const router = express.Router();

router.post("/data", createEnergeticaHandler);

export default router;