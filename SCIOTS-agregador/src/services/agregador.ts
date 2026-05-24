import Agregador from "../models/agregador.js";

export const createAgregador = async (
  agregadorData: { c: string | number | bigint }
) => {
  const agregadordata = new Agregador({
    c: agregadorData.c.toString(),
  });

  return await agregadordata.save();
};

export const sendAgregadorData = async () => {
  // 1. Recuperem tots els ciphertexts guardats
  const agregadoresData = await Agregador.find();

  if (agregadoresData.length === 0) {
    throw new Error("No hi ha dades xifrades per agregar.");
  }

  // 2. Demanem la clau pública a Energètica per obtenir n
  const pubKeyResponse = await fetch("http://localhost:3000/pubKey");

  if (!pubKeyResponse.ok) {
    throw new Error("No s'ha pogut obtenir la clau pública d'Energètica.");
  }

  const pubKeyData = await pubKeyResponse.json();
  const n = BigInt(pubKeyData.n);

  // 3. Multipliquem tots els ciphertexts mòdul n
  let aggregatedCiphertext = 1n;

  for (const item of agregadoresData) {
    aggregatedCiphertext =
      (aggregatedCiphertext * BigInt(item.c)) % n;
  }

  console.log(
    "Ciphertext agregat:",
    aggregatedCiphertext.toString()
  );

  // 4. Enviem un únic ciphertext agregat a Energètica
  const response = await fetch("http://localhost:3000/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      c: aggregatedCiphertext.toString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Error enviant el ciphertext agregat a Energètica.");
  }

  const result = await response.json();

  // 5. Esborrem les dades ja processades
  await Agregador.deleteMany();

  return result;
};