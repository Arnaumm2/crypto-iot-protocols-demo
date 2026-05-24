import Energetica from "../models/energetica.js";

export const createEnergetica = async(energeticaData: { c: bigint }) => {
    const energetica = new Energetica({ c: energeticaData.c.toString() });
    return await energetica.save();
};