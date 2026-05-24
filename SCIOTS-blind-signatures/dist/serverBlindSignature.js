import express from "express";
import dotenv from "dotenv";
import { publicKeyJson, privateKey, } from "./generateKeys.js";
dotenv.config({ quiet: true });
const app = express();
const port = 3002;
app.use(express.json());
// Ruta de prova
app.get("/", (_req, res) => {
    res.send("Blind Signatures Server running!");
});
// El client demana la clau pública
app.get("/pubKey", (_req, res) => {
    res.json(publicKeyJson);
});
// El servidor rep un missatge cegat i el signa
app.post("/blind-sign", (req, res) => {
    try {
        const { blindedMessage } = req.body;
        if (!blindedMessage) {
            return res.status(400).json({
                error: "Missing blindedMessage",
            });
        }
        const blindedMessageBigInt = BigInt(blindedMessage);
        // El servidor signa sense saber quin és el missatge original
        const blindSignature = privateKey.sign(blindedMessageBigInt);
        return res.json({
            blindSignature: blindSignature.toString(),
        });
    }
    catch (error) {
        console.error("Error generating blind signature:", error);
        return res.status(500).json({
            error: "Error generating blind signature",
        });
    }
});
app.listen(port, () => {
    console.log(`Blind Signatures Server listening at http://localhost:${port}`);
});
