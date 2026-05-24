import { bitLength as getBitLength, gcd, modPow, modInv, primeSync } from 'bigint-crypto-utils';
export class RsaPublicKey {
    n: bigint;
    e: bigint;
    constructor(n: bigint, e: bigint) {
        this.n = n;
        this.e = e;
    }
    encrypt(message: bigint): bigint {
        return modPow(message, this.e, this.n);
    }
    verify(signature: bigint): bigint {
        return modPow(signature, this.e, this.n);
    }
}

export class RsaPrivateKey {
    n: bigint;
    d: bigint
    constructor(n: bigint, d: bigint) {
        this.n = n;
        this.d = d;
    }
    decrypt(ciphertext: bigint): bigint {
        return modPow(ciphertext, this.d, this.n);
    }
    sign(message: bigint): bigint {
        return modPow(message, this.d, this.n);
    }
}

export function generateKeyPair(bitLength: number): { publicKey: RsaPublicKey; privateKey: RsaPrivateKey } {
    const e = 65537n;
    let p: bigint, q: bigint, n: bigint, phi: bigint, d: bigint;
    do {
        p = primeSync(bitLength / 2 + 1);
        q = primeSync(bitLength / 2);
        n = p * q;
        phi = (p - 1n) * (q - 1n);
    } while (getBitLength(n) !== bitLength || gcd(e, phi) !== 1n);
    d = modInv(e, phi);
    return {
        publicKey: new RsaPublicKey(n, e),
        privateKey: new RsaPrivateKey(n, d),
    };
}
