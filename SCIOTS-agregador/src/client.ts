import { RsaPublicKey } from "./rsa.js";

const ENERGETICA_URL = "http://localhost:3000";
const AGREGADOR_URL = "http://localhost:3001";

// Valor que envia aquest client
const valorClient = 5n;

const main = async () => {
  try {
    // 1. Demanem la clau pública al servidor Energètica
    const pubKeyResponse = await fetch(`${ENERGETICA_URL}/pubKey`);

    if (!pubKeyResponse.ok) {
      throw new Error(
        `Error obtenint la clau pública: ${pubKeyResponse.status}`
      );
    }

    const pubKeyData = await pubKeyResponse.json();

    const publicKey = new RsaPublicKey(
      BigInt(pubKeyData.n),
      BigInt(pubKeyData.e)
    );

    console.log("Clau pública rebuda correctament");

    // 2. El client xifra la seva dada
    const encryptedValue = publicKey.encrypt(valorClient);

    console.log(`Valor original del client: ${valorClient}`);
    console.log(`Valor xifrat: ${encryptedValue.toString()}`);

    // 3. Enviem el ciphertext a l'agregador
    const agregadorResponse = await fetch(`${AGREGADOR_URL}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        c: encryptedValue.toString(),
      }),
    });

    if (!agregadorResponse.ok) {
      throw new Error(
        `Error enviant el ciphertext a l'agregador: ${agregadorResponse.status}`
      );
    }

    const result = await agregadorResponse.json();

    console.log("Ciphertext enviat a l'agregador correctament");
    console.log(result);
  } catch (error) {
    console.error("Error al client:", error);
  }
};

main();