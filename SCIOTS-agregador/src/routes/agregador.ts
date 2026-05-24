import express from "express";
import { createAgregadorHandler,sendAgregadorDataHandler } from "../controllers/agregador.js";

const router = express.Router();

router.post("/data", createAgregadorHandler);
router.post("/send", sendAgregadorDataHandler);

export default router;