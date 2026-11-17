# MEDCHAIN Key Lifecycle & Key Management

This document defines the key generation, storage, wrapping, rotation, and revocation procedures implemented in MEDCHAIN.

---

## 1. Key Taxonomy

| Key Type | Algorithm | Generation Location | Storage Location | Lifetime |
|---|---|---|---|---|
| **Data Encryption Key (DEK)** | AES-256 (256-bit symmetric) | Client browser in-memory | Never stored in plaintext. Exists only as wrapped ciphertext in DB. | Single document; rotated if re-encrypted. |
| **Patient Key Encryption Key (KEK)** | PBKDF2 derived / Ed25519 | Client browser | Encrypted in client browser storage or password-derived. | Long-term; user account lifecycle. |
| **Doctor Public Key** | Ed25519 / RSA-2048 | Doctor client browser | Registered on `IdentityRegistry` smart contract and User profile. | Credential lifecycle. |
| **Doctor Private Key** | Ed25519 / RSA-2048 | Doctor client browser | Client hardware or secure browser enclave only. | Retained by doctor workstation. |
| **System Signing Key** | ECDSA / Ed25519 | Local Hardhat node | EVM keystore. | Local development environment. |

---

## 2. Key Wrapping Protocol (Envelope Encryption)

1. When a patient uploads document $D$:
   - Generate random $DEK \leftarrow \text{PRNG}(256)$
   - Compute ciphertext $C = \text{AES-GCM}(D, DEK, IV)$
   - Wrap $E_{patient} = \text{Wrap}(DEK, KEK_{patient})$
   - Persist $E_{patient}$ to `EncryptedKeyEnvelope` table.

2. When the patient grants consent to Doctor $Doc$:
   - Patient client unwraps $DEK = \text{Unwrap}(E_{patient}, KEK_{patient})$
   - Patient client wraps $E_{Doc} = \text{Wrap}(DEK, PubKey_{Doc})$
   - Submit $E_{Doc}$ to `EncryptedKeyEnvelope` associated with $(RecordID, DocID)$.

3. When access is revoked:
   - Mark $E_{Doc}$ as `isActive = false` in database.
   - Anchor revocation event on `ConsentManager` contract.
   - Invalidate authorization cache.

---

## 3. Critical Revocation Limitation

> [!CAUTION]
> **Cryptographic Revocation Boundary**: Revocation prevents **future** key retrieval, blocks future requests, and invalidates the smart contract permission. It is physically and mathematically impossible for any cryptographic platform to remotely delete or overwrite unencrypted data that an authorized doctor already downloaded and cached locally prior to the revocation timestamp.
