import { createHash, randomBytes } from "node:crypto";
import { gcd, modPow, modInv } from "bigint-crypto-utils";
import { RsaPublicKey } from "./rsa.js";

const BLIND_SERVER_URL = "http://localhost:3002";

function hashMessageToBigInt(message: string): bigint {
  const hashHex = createHash("sha256")
    .update(message)
    .digest("hex");

  return BigInt(`0x${hashHex}`);
}

function generateBlindingFactor(n: bigint): bigint {
  let r: bigint;

  do {
    const randomHex = randomBytes(256).toString("hex");
    r = BigInt(`0x${randomHex}`) % n;
  } while (r <= 1n || gcd(r, n) !== 1n);

  return r;
}

const main = async () => {
  try {
    // 1. Obtenir la clau pública del servidor
    const pubKeyResponse = await fetch(`${BLIND_SERVER_URL}/pubKey`);

    if (!pubKeyResponse.ok) {
      throw new Error("No s'ha pogut obtenir la clau pública.");
    }

    const pubKeyData = await pubKeyResponse.json();

    const publicKey = new RsaPublicKey(
      BigInt(pubKeyData.n),
      BigInt(pubKeyData.e)
    );

    console.log("Clau pública rebuda correctament.");

    // 2. Missatge que el client vol que el servidor signi
    const originalMessage = "Aquest és el meu missatge secret";

    // 3. El convertim a un nombre amb SHA-256
    const messageHash = hashMessageToBigInt(originalMessage);

    console.log("Missatge original:", originalMessage);
    console.log("Hash del missatge:", messageHash.toString());

    // 4. Generem el factor de blinding r
    const r = generateBlindingFactor(publicKey.n);

    // 5. Ceguem el missatge:
    // blindedMessage = m * r^e mod n
    const rPowE = modPow(r, publicKey.e, publicKey.n);
    const blindedMessage =
      (messageHash * rPowE) % publicKey.n;

    console.log("Missatge cegat:", blindedMessage.toString());

    // 6. Enviem el missatge cegat al servidor perquè el signi
    const blindSignResponse = await fetch(`${BLIND_SERVER_URL}/blind-sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blindedMessage: blindedMessage.toString(),
      }),
    });

    if (!blindSignResponse.ok) {
      throw new Error("Error demanant la blind signature.");
    }

    const blindSignData = await blindSignResponse.json();
    const blindSignature = BigInt(blindSignData.blindSignature);

    console.log("Blind signature rebuda:", blindSignature.toString());

    // 7. Desceguem la signatura:
    // signature = blindSignature * r^-1 mod n
    const rInverse = modInv(r, publicKey.n);
    const finalSignature =
      (blindSignature * rInverse) % publicKey.n;

    console.log("Signatura final descegada:", finalSignature.toString());

    // 8. Verificació:
    // signature^e mod n ha de ser igual al hash original
    const verifiedMessageHash = publicKey.verify(finalSignature);

    console.log(
      "Hash recuperat de la signatura:",
      verifiedMessageHash.toString()
    );

    const isValid = verifiedMessageHash === messageHash;

    console.log("Signatura vàlida?", isValid);
  } catch (error) {
    console.error("Error al client de blind signatures:", error);
  }
};

main();