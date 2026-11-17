// MedChain Digital Signatures
// Ed25519 signing and verification for data integrity

import * as ed from '@noble/ed25519';

/** Sign data with an Ed25519 private key */
export async function sign(data: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
  return ed.signAsync(data, privateKey);
}

/** Verify a signature with an Ed25519 public key */
export async function verify(
  signature: Uint8Array,
  data: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    return await ed.verifyAsync(signature, data, publicKey);
  } catch {
    return false;
  }
}

/** Sign a string and return hex-encoded signature */
export async function signString(text: string, privateKey: Uint8Array): Promise<string> {
  const data = new TextEncoder().encode(text);
  const sig = await sign(data, privateKey);
  return Array.from(sig)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Verify a hex-encoded signature against a string */
export async function verifyString(
  text: string,
  signatureHex: string,
  publicKey: Uint8Array
): Promise<boolean> {
  const data = new TextEncoder().encode(text);
  const sig = new Uint8Array(signatureHex.length / 2);
  for (let i = 0; i < signatureHex.length; i += 2) {
    sig[i / 2] = parseInt(signatureHex.substring(i, i + 2), 16);
  }
  return verify(sig, data, publicKey);
}

/** Create a content hash (SHA-256) for integrity verification */
export async function hashContent(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as any);
  return new Uint8Array(hashBuffer);
}
