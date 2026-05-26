import { createHash, randomBytes } from "node:crypto";
import { gcd, modPow, modInv } from "bigint-crypto-utils";
import { CoapClient as coap } from "node-coap-client";
import { RsaPublicKey } from "./rsa.js";

// Reverse proxy CoAP -> HTTP
const COAP_HOST = "172.29.183.52";
const COAP_PORT = 5683;
const COAP_BASE_URL = `coap://${COAP_HOST}:${COAP_PORT}`;

function hashMessageToBigInt(message: string): bigint {
  const hashHex = createHash("sha256").update(message).digest("hex");

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

async function coapGetJson<T>(path: string): Promise<T> {
  const response = await coap.request(
    `${COAP_BASE_URL}${path}`,
    "get",
    undefined,
    { keepAlive: false },
  );

  const text = response.payload?.toString("utf8") ?? "";

  console.log("CoAP response code:", response.code);
  console.log("CoAP raw payload:", text);

  if (!text) {
    throw new Error(`Resposta CoAP buida a GET ${path}`);
  }

  return JSON.parse(text) as T;
}

async function coapPostJson<T>(path: string, body: unknown): Promise<T> {
  const payload = Buffer.from(JSON.stringify(body), "utf8");

  const response = await coap.request(
    `${COAP_BASE_URL}${path}`,
    "post",
    payload,
    { keepAlive: false },
  );

  if (!response.payload) {
    throw new Error(`Resposta CoAP buida a POST ${path}`);
  }

  return JSON.parse(response.payload.toString("utf8")) as T;
}

const main = async () => {
  try {
    // 1. Obtenir la clau pública del servidor via CoAP proxy
    const pubKeyData = await coapGetJson<{ n: string; e: string }>("/pubKey");

    const publicKey = new RsaPublicKey(
      BigInt(pubKeyData.n),
      BigInt(pubKeyData.e),
    );

    console.log("Clau pública rebuda correctament via CoAP.");

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
    const blindedMessage = (messageHash * rPowE) % publicKey.n;

    console.log("Missatge cegat:", blindedMessage.toString());

    // 6. Enviem el missatge cegat al servidor via CoAP proxy
    const blindSignData = await coapPostJson<{ blindSignature: string }>(
      "/blind-sign",
      {
        blindedMessage: blindedMessage.toString(),
      },
    );

    const blindSignature = BigInt(blindSignData.blindSignature);

    console.log("Blind signature rebuda:", blindSignature.toString());

    // 7. Desceguem la signatura:
    // signature = blindSignature * r^-1 mod n
    const rInverse = modInv(r, publicKey.n);
    const finalSignature = (blindSignature * rInverse) % publicKey.n;

    console.log("Signatura final descegada:", finalSignature.toString());

    // 8. Verificació:
    // signature^e mod n ha de ser igual al hash original
    const verifiedMessageHash = publicKey.verify(finalSignature);

    console.log(
      "Hash recuperat de la signatura:",
      verifiedMessageHash.toString(),
    );

    const isValid = verifiedMessageHash === messageHash;

    console.log("Signatura vàlida?", isValid);
  } catch (error) {
    console.error("Error al client de blind signatures:", error);
  } finally {
    coap.reset();
  }
};

main();
