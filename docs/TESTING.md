# MEDCHAIN Testing Strategy & Verification Suite

This document defines the comprehensive test suite covering smart contracts, cryptographic functions, backend API endpoints, and end-to-end integration flows.

---

## 1. Test Pyramid Overview

```
             / \
            /   \      E2E Integration Workflows
           / E2E \     (Patient upload -> Anchor -> Doctor grant -> Verify)
          /-------\
         /   API   \   API Integration & Authorization Matrix
        /  Routes   \  (Role boundaries, revoked access rejection, Zod)
       /-------------\
      / Smart Contract\ Hardhat EVM Contract Tests
     /   & Crypto      \ (AES round-trips, tampering detection, gas limits)
    /-------------------\
```

---

## 2. Test Suites

### A. Cryptographic Protocol Tests
- **AES-256-GCM Round-trip**: Verifies that 100% of encrypted files decrypt accurately with the genuine key.
- **Tampering Detection**: Verifies that altering a single byte in the ciphertext or nonce triggers `OperationError` during authentication tag validation.
- **Wrong Key Rejection**: Validates that attempting to decrypt with an incorrect key fails without exposing data.
- **Envelope Key Wrapping**: Confirms that only intended recipient keyholders can unwrap the DEK.

### B. Smart Contract Hardhat Tests
- **`MedicalRecordRegistry`**: Validates registration, version increments, duplicate rejection, and content hash lookups.
- **`ConsentManager`**: Validates `grantConsent`, `revokeConsent`, `checkConsent`, and strict expiration checks.
- **Negative Tests**: Confirms unauthorized addresses cannot register records or grant consent on behalf of other patients.

### C. Backend API Integration Tests
- **Auth Flow**: Registration, duplicate rejection, password hashing with bcrypt, JWT token validity.
- **Consent Enforcement**: Verifies that doctors cannot access records without an active consent grant.
- **Revocation Enforcement**: Confirms that when consent is revoked, `/api/records` returns HTTP 403 Forbidden.
- **Integrity Challenge**: Tests both authentic matching and simulated unauthorized tamper detection.
