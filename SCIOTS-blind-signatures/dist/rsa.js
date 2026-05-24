import { bitLength as getBitLength, gcd, modPow, modInv, primeSync } from 'bigint-crypto-utils';
export class RsaPublicKey {
    n;
    e;
    constructor(n, e) {
        this.n = n;
        this.e = e;
    }
    encrypt(message) {
        return modPow(message, this.e, this.n);
    }
    verify(signature) {
        return modPow(signature, this.e, this.n);
    }
}
export class RsaPrivateKey {
    n;
    d;
    constructor(n, d) {
        this.n = n;
        this.d = d;
    }
    decrypt(ciphertext) {
        return modPow(ciphertext, this.d, this.n);
    }
    sign(message) {
        return modPow(message, this.d, this.n);
    }
}
export function generateKeyPair(bitLength) {
    const e = 65537n;
    let p, q, n, phi, d;
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
