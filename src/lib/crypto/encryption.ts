// MedChain Encryption Utilities
// Client-side AES-256-GCM encryption using Web Crypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

/** Generate a random AES-256 key */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/** Export a CryptoKey to raw bytes */
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/** Import raw bytes as a CryptoKey */
export async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey as any,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/** Encrypt data with AES-256-GCM. Returns iv + ciphertext concatenated. */
export async function encrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as any, tagLength: TAG_LENGTH },
    key,
    data as any
  );
  // Prepend IV to ciphertext
  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.length);
  return result;
}

/** Decrypt AES-256-GCM data. Expects iv + ciphertext concatenated. */
export async function decrypt(encryptedData: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
  const iv = encryptedData.slice(0, IV_LENGTH);
  const ciphertext = encryptedData.slice(IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as any, tagLength: TAG_LENGTH },
    key,
    ciphertext as any
  );
  return new Uint8Array(decrypted);
}

/** Encrypt a string and return base64 */
export async function encryptString(text: string, key: CryptoKey): Promise<string> {
  const data = new TextEncoder().encode(text);
  const encrypted = await encrypt(data, key);
  return btoa(String.fromCharCode(...encrypted));
}

/** Decrypt a base64 string */
export async function decryptString(base64: string, key: CryptoKey): Promise<string> {
  const encrypted = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const decrypted = await decrypt(encrypted, key);
  return new TextDecoder().decode(decrypted);
}
