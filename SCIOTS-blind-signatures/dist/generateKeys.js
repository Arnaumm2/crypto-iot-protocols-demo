import { generateKeyPair } from "./rsa.js";
const keypair = generateKeyPair(2048);
export const publicKey = keypair.publicKey;
export const privateKey = keypair.privateKey;
export const publicKeyJson = {
    n: publicKey.n.toString(),
    e: publicKey.e.toString()
};
export const privateKeyJson = {
    n: privateKey.n.toString(),
    d: privateKey.d.toString()
};
