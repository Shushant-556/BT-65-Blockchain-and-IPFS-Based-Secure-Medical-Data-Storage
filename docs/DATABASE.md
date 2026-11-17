# MEDCHAIN Database Architecture & Schema Specification

This document details the normalized relational database schema managed via **Prisma ORM** with an embedded **SQLite** data store.

---

## 1. Relational Entity Relationship Diagram

```
+----------------+       1:1       +------------------+
|      User      | <-------------> |  PatientProfile  |
|                |                 +--------+---------+
| - id (cuid)    |                          | 1:N
| - email        |                          v
| - passwordHash |                 +------------------+       1:N       +----------------------+
| - role         |                 |  MedicalRecord   | <-------------> | MedicalRecordVersion |
| - walletAddress|                 +--------+---------+                 +----------------------+
| - publicKey    |                          |
+-------+--------+                          | 1:N
        |                                   v
        | 1:1                      +------------------+
        v                          |EncryptedEnvelope |
+----------------+                 +------------------+
| DoctorProfile  |                          ^
|                |                          | 1:N
| - hospitalId   |                          |
+-------+--------+                 +--------+---------+
        |                          |   ConsentGrant   |
        | N:1                      |                  |
        v                          | - scope          |
+----------------+                 | - expiresAt      |
|    Hospital    |                 | - isRevoked      |
+----------------+                 +------------------+
```

---

## 2. Key Table Definitions

### `User`
- Central identity entity supporting four roles: `PATIENT`, `DOCTOR`, `HOSPITAL`, `ADMIN`.
- Passwords hashed using bcrypt (10 rounds).
- Public encryption keys and Ethereum wallet addresses stored for cryptographic routing.

### `MedicalRecord`
- Stores clinical metadata, attending physician name, category, examination date.
- **Never stores plaintext document content**.
- References the decentralized storage location via `encryptedCid` and the on-chain anchor via `contentHash` and `blockchainTxHash`.

### `EncryptedKeyEnvelope`
- Stores wrapped Data Encryption Keys (DEKs) for authorized recipients.
- Indexed by `(recordId, userId, version)`.
- Deactivated (`isActive = false`) immediately upon consent revocation.

### `ConsentGrant` & `ConsentHistory`
- Tracks patient-granted authorizations to doctors.
- Enforces time expiration (`expiresAt`) and scope (`SELECTED_RECORDS`, `CATEGORY`, `ALL_CURRENT`).
- Append-only audit history table `ConsentHistory` logs all grant, modification, and revocation events.

### `AuditEvent` & `AccessLog`
- Immutable system logs recording every view, decryption, and verification attempt.
- Includes actor ID, subject ID, resource ID, timestamp, and severity level.
