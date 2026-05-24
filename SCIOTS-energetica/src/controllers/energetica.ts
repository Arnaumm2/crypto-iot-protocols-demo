import {Request, Response} from 'express';
import { createEnergetica } from "../services/energetica.js";
import { publicKey, privateKey } from "../generateKeys.js";

export const createEnergeticaHandler = async (req: Request, res: Response) => {
    try {
        const encryptedC = BigInt(req.body.c);
        const decryptedC = privateKey.decrypt(encryptedC);
        const newEnergetica = await createEnergetica({ c: decryptedC });
        res.status(201).json(newEnergetica);
    } catch (error) {
        res.status(500).json({ message: 'Error creating energetica', error });
    }
};