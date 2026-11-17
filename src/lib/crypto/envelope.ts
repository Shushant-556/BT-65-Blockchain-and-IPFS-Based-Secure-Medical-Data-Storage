// MedChain Envelope Encryption
// Encrypt data with a random DEK, then encrypt the DEK with the user's key

import { generateEncryptionKey, encrypt, decrypt, exportKey, importKey } from './encryption';

export interface EncryptedEnvelope {
  encryptedData: Uint8Array;
  encryptedDek: Uint8Array;
  algorithm: string;
  version: number;
}

export interface SerializedEnvelope {
  encryptedData: string; // base64
  encryptedDek: string; // base64
  algorithm: string;
  version: number;
}

/** Encrypt data using envelope encryption */
export async function sealEnvelope(
  data: Uint8Array,
  masterKey: CryptoKey
): Promise<EncryptedEnvelope> {
  // Generate a random Data Encryption Key (DEK)
  const dek = await generateEncryptionKey();

  // Encrypt the data with the DEK
  const encryptedData = await encrypt(data, dek);

  // Encrypt the DEK with the master key
  const rawDek = await exportKey(dek);
  const encryptedDek = await encrypt(rawDek, masterKey);

  return {
    encryptedData,
    encryptedDek,
    algorithm: 'AES-256-GCM',
    version: 1,
  };
}

/** Decrypt an envelope */
export async function openEnvelope(
  envelope: EncryptedEnvelope,
  masterKey: CryptoKey
): Promise<Uint8Array> {
  // Decrypt the DEK
  const rawDek = await decrypt(envelope.encryptedDek, masterKey);
  const dek = await importKey(rawDek);

  // Decrypt the data with the DEK
  return decrypt(envelope.encryptedData, dek);
}

/** Serialize an envelope for storage/transport */
export function serializeEnvelope(envelope: EncryptedEnvelope): SerializedEnvelope {
  return {
    encryptedData: btoa(String.fromCharCode(...envelope.encryptedData)),
    encryptedDek: btoa(String.fromCharCode(...envelope.encryptedDek)),
    algorithm: envelope.algorithm,
    version: envelope.version,
  };
}

/** Deserialize an envelope from storage/transport */
export function deserializeEnvelope(serialized: SerializedEnvelope): EncryptedEnvelope {
  return {
    encryptedData: Uint8Array.from(atob(serialized.encryptedData), (c) => c.charCodeAt(0)),
    encryptedDek: Uint8Array.from(atob(serialized.encryptedDek), (c) => c.charCodeAt(0)),
    algorithm: serialized.algorithm,
    version: serialized.version,
  };
}
