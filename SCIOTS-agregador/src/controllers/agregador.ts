import { Request, Response } from "express";
import { createAgregador, sendAgregadorData } from "../services/agregador.js";

export const createAgregadorHandler = async (req: Request, res: Response) => {
    try {
        const agregadorData = req.body;
        const newAgregador = await createAgregador(agregadorData);
        res.status(201).json(newAgregador);
    } catch (error) {
        res.status(500).json({ message: "Error creating agregador", error });
    }
};

export const sendAgregadorDataHandler = async (_req: Request, res: Response) => {
    try {
        const agregadoresData = await sendAgregadorData();
        res.status(200).json(agregadoresData);
    } catch (error) {
        res.status(500).json({ message: "Error sending agregador data", error });
    }
};