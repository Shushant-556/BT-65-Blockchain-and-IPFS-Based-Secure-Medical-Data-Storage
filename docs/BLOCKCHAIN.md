# MEDCHAIN Blockchain Architecture & Smart Contracts

This document details the Solidity smart contract architecture, gas optimizations, and deployment procedures.

---

## 1. Smart Contract Architecture

The blockchain layer consists of 4 modular smart contracts written in **Solidity 0.8.24** using OpenZeppelin v5 AccessControl:

### 1. `MedicalRecordRegistry.sol`
- **Purpose**: Anchors medical record fingerprints and associated encrypted IPFS CIDs.
- **Key Functions**:
  - `registerRecord(bytes32 recordId, bytes32 contentHash, string calldata encryptedCid, bytes32 metadataHash)`
  - `registerVersion(bytes32 recordId, bytes32 contentHash, string calldata encryptedCid, uint256 version)`
  - `verifyRecord(bytes32 recordId, bytes32 contentHash)` returns `bool`
- **Events**: `RecordRegistered`, `RecordVersionAdded`, `RecordDeactivated`
- **Privacy Design**: Strictly zero plaintext medical information is passed to or stored within this contract.

### 2. `ConsentManager.sol`
- **Purpose**: Enforces patient-controlled authorization and time-limited clinical access.
- **Key Functions**:
  - `grantConsent(address patient, address doctor, bytes32 recordId, uint256 scope, uint256 expiresAt)`
  - `revokeConsent(address patient, address doctor, bytes32 recordId)`
  - `checkConsent(address patient, address doctor, bytes32 recordId)` returns `(bool isValid, uint256 scope, uint256 expiresAt)`
- **Scopes**:
  - `1 = SELECTED_RECORDS`
  - `2 = CATEGORY`
  - `3 = ALL_CURRENT`
- **Security Check**: Enforces that only the record owner (patient) can grant or revoke consent.

### 3. `IdentityRegistry.sol`
- **Purpose**: Manages healthcare provider credentials and public encryption verification keys.
- **Key Functions**:
  - `registerIdentity(address user, bytes32 role, bytes calldata publicKey)`
  - `updateCredential(address doctor, bytes32 credentialHash, uint256 status)`
- **Privacy Design**: Doctor names, medical registration numbers, and hospital IDs are hashed before on-chain registration.

### 4. `AuditRegistry.sol`
- **Purpose**: Provides an immutable, append-only audit trail for access verification.
- **Key Functions**:
  - `logEvent(bytes32 eventType, bytes32 subjectHash, bytes32 actorHash, bytes32 resourceHash, bytes32 detailsHash)`
  - `getEvent(uint256 eventId)`
  - `getEventCount()`

---

## 2. Local Hardhat Configuration

- **Solidity Version**: `0.8.24`
- **Optimizer**: Enabled (200 runs)
- **Local Network**: Hardhat in-process node (`http://127.0.0.1:8545`)
- **Gas Efficiency**: Mappings are used exclusively over unbounded arrays to eliminate gas exhaustion vulnerabilities.
