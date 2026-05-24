import { RsaPublicKey, RsaPrivateKey, generateKeyPair } from "./rsa.js";

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

// const publicKeyString = JSON.stringify(publicKeyJson);
// const privateKeyString = JSON.stringify(privateKeyJson);

// const message = 15478412n;
// const encryptedMsg = publicKey.encrypt(message);
// const decryptedMsg = privateKey.decrypt(encryptedMsg);

// console.log("Original: ", message);
// console.log("Cifrado:  ", encryptedMsg);
// console.log("Descifrado:", decryptedMsg);
// console.log("Correcto: ", message === decryptedMsg);
