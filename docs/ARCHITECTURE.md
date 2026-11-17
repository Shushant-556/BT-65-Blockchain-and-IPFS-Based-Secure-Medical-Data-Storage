# MEDCHAIN System Architecture

## 1. Executive Summary

MEDCHAIN is an academic-grade decentralized healthcare data management platform designed to guarantee patient data sovereignty, zero-knowledge clinical privacy, cryptographic integrity verification, and auditable consent management.

The architecture fundamentally departs from traditional centralized electronic health record (EHR) databases:
1. **No plaintext medical records** are ever transmitted to the server or stored on decentralized networks.
2. **Patient-controlled envelope encryption** ensures records can only be decrypted by explicitly consented healthcare professionals.
3. **Decentralized content-addressing (IPFS CIDs)** prevents centralized honeypot breaches.
4. **Smart contract anchors (Ethereum EVM)** provide non-repudiable integrity proofs and consent enforcement.
5. **HL7 FHIR Release 4 mapping** bridges decentralized records with healthcare industry standards.

---

## 2. High-Level Component Topology

```
+-----------------------------------------------------------------------------------+
|                              CLIENT BROWSER RUNTIME                               |
|                                                                                   |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  |   Patient Portal   |   |    Doctor Portal    |   | Hospital & Admin Portals |  |
|  +---------+----------+   +----------+----------+   +------------+-------------+  |
|            |                         |                           |                |
|            +-------------------------+---------------------------+                |
|                                      |                                            |
|                  +-------------------+--------------------+                       |
|                  |       WebCrypto API Security Layer     |                       |
|                  |  - Client-side AES-256-GCM Encryption  |                       |
|                  |  - Random DEK (256-bit) + IV (96-bit)  |                       |
|                  |  - Asymmetric Key Wrapping (RSA/KW)    |                       |
|                  |  - SHA-256 Content Fingerprinting      |                       |
|                  +-------------------+--------------------+                       |
+--------------------------------------|--------------------------------------------+
                                       | Encrypted Payload & Signatures Only
                                       v
+-----------------------------------------------------------------------------------+
|                        APPLICATION SERVER & API GATEWAY                           |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |  JWT Authentication |   |  Zod Request Schema |   |  Transparent Audit Log  |  |
|  |  & RBAC Middleware  |   |  Validation Engine  |   |  & Security Monitor     |  |
|  +----------+----------+   +----------+----------+   +------------+------------+  |
|             |                         |                           |               |
+-------------|-------------------------|---------------------------|---------------+
              |                         |                           |
              v                         v                           v
+-----------------------+     +--------------------+      +-------------------------+
|   SQLITE DATA STORE   |     |    IPFS ENCRYPTED  |      |   HARDHAT EVM SMART     |
|   (Embedded Zero-RAM) |     |    CONTENT ENGINE  |      |   CONTRACT REGISTRY     |
|                       |     |                    |      |                         |
| - Users & Personas    |     | - CID Multihash    |      | - MedicalRecordRegistry |
| - Non-sensitive meta  |     | - Zero Plaintext   |      | - ConsentManager        |
| - Wrapped envelopes   |     | - Local & Cluster  |      | - IdentityRegistry      |
| - FHIR resource index |     |   Pinning Adapters |      | - AuditRegistry         |
+-----------------------+     +--------------------+      +-------------------------+
```

---

## 3. Core Subsystems

### A. Client-Side Cryptographic Subsystem
- **AES-256-GCM**: Symmetrical encryption standard for payload data. Every file upload generates a cryptographically random, single-use 256-bit Data Encryption Key (DEK) and a 96-bit unique initialization vector (IV).
- **Envelope Encryption**: DEKs are never stored in plaintext. The DEK is encrypted using the patient's Key Encryption Key (KEK). When consent is granted, the DEK is wrapped for the specific recipient doctor's public key.
- **Key Derivation (HKDF/PBKDF2)**: Salted, iterative key derivation prevents dictionary and rainbow table attacks.
- **SHA-256 Fingerprinting**: Encrypted ciphertext is hashed using SHA-256 to create an immutable content fingerprint anchored on the Ethereum ledger.

### B. Decentralized Storage Abstraction
- Operates under content-addressing paradigms using IPFS Content Identifiers (`bafybei...`).
- The storage abstraction layer supports:
  1. Embedded Local Encrypted CID Store (default, optimized for low memory footprint).
  2. External IPFS Kubo Node via IPFS HTTP Client API (`/api/v0/add`, `/api/v0/cat`).
  3. Private IPFS Clusters or Pinning Providers.

### C. Blockchain Smart Contracts (Ethereum EVM)
- Written in **Solidity 0.8.24** using OpenZeppelin v5 access control contracts:
  1. `MedicalRecordRegistry.sol`: Maps `bytes32 recordId` to `contentHash`, `encryptedCid`, and version history.
  2. `ConsentManager.sol`: Authorizes doctor addresses with granular scopes (`SELECTED_RECORDS`, `CATEGORY`, `ALL_CURRENT`) and strict timestamp expiration.
  3. `IdentityRegistry.sol`: Maintains doctor license hashes and verification keys without exposing personal identifiable information (PII).
  4. `AuditRegistry.sol`: Logs access and verification events on an immutable ledger.

### D. Healthcare Interoperability (FHIR R4)
- Bidirectional translation to HL7 FHIR Release 4 standard schemas:
  - `FHIR DocumentReference`
  - `FHIR Patient`
  - `FHIR Practitioner`
  - `FHIR Consent`
