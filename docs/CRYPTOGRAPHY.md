# MEDCHAIN Cryptographic Protocols Specification

This document details the exact mathematical and algorithmic specifications of the cryptographic primitives implemented across MEDCHAIN.

---

## 1. Symmetrical Encryption — AES-256-GCM

All patient medical documents (PDF, DICOM, images, structured lab reports) are encrypted using **Advanced Encryption Standard in Galois/Counter Mode (AES-256-GCM)** via the W3C Web Cryptography API (`crypto.subtle`).

### Parameters:
- **Cipher**: AES-GCM (NIST SP 800-38D compliant)
- **Key Length**: 256 bits (32 bytes)
- **Initialization Vector (IV / Nonce)**: 96 bits (12 bytes), generated per encryption event using `crypto.getRandomValues(new Uint8Array(12))`
- **Authentication Tag Length**: 128 bits (16 bytes)
- **Payload Format**: `[ IV (12 bytes) || Ciphertext (Variable) || Tag (16 bytes) ]`

```typescript
// Key generation
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Payload authenticated encryption
const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: randomIv, tagLength: 128 },
  key,
  plaintextBuffer
);
```

---

## 2. Envelope Encryption Protocol

To achieve multi-recipient access without re-encrypting multi-megabyte medical files:

1. **Document Encryption**: The file is encrypted using a unique, ephemeral Data Encryption Key (DEK).
2. **Patient Envelope**: The DEK is encrypted under the patient's Key Encryption Key (KEK) and stored as `EncryptedKeyEnvelope` in the database.
3. **Consented Provider Envelope**: When the patient approves doctor access, the DEK is unwrapped client-side and re-wrapped under the doctor's public key (RSA-OAEP-256 or AES-KW with shared secret).
4. **Revocation Deactivation**: Upon revocation, the recipient doctor's envelope is deactivated in the database and invalidated on the smart contract.

---

## 3. Digital Signatures & Non-Repudiation (Ed25519)

Doctor clinical attestations and patient consent approvals are signed using **Edwards-curve Digital Signature Algorithm (Ed25519)**:
- **Curve**: Curve25519 (RFC 8032)
- **Signature Length**: 64 bytes (512 bits)
- **Public Key Length**: 32 bytes (256 bits)
- **Security Strength**: ~128-bit security level, resistant to side-channel timing attacks.

---

## 4. Key Derivation (PBKDF2 & HKDF)

Passphrase-based key generation uses **PBKDF2** with:
- **Pseudo-Random Function**: HMAC-SHA-256
- **Iteration Count**: 100,000 rounds
- **Salt**: 16 bytes cryptographically secure random salt per user
