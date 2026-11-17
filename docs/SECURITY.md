# MEDCHAIN Security Architecture & Principles

## 1. Core Principles

MEDCHAIN adheres to 15 core architectural security principles:

1. **Privacy by Design**: Cryptographic isolation guarantees that personal health data remains confidential across untrusted transport and storage tiers.
2. **Patient-Controlled Consent**: Healthcare providers cannot access records without cryptographic approval granted directly by the patient.
3. **Encryption Before Storage**: Client-side AES-256-GCM encryption occurs prior to network egress.
4. **Blockchain for Verification, Not Storage**: Public blockchains never store plaintext medical documents, patient names, diagnoses, or identifiers.
5. **Decentralized Content Integrity**: IPFS CIDs combined with SHA-256 signatures ensure immediate detection of any data tampering.
6. **No Plaintext Medical Records on IPFS**: All data persisted to IPFS is binary ciphertext.
7. **No PII on Blockchain**: Only cryptographic hashes, encrypted CIDs, and pseudonymous addresses appear on-chain.
8. **Least-Privilege Authorization**: Permissions are bounded by time, category, and specific document scope.
9. **Verifiable Record Integrity**: On-demand integrity verification compares retrieved ciphertext against immutable blockchain anchors.
10. **Transparent Audit History**: All access, verification, and revocation events are logged in an immutable audit ledger.
11. **Strict Separation of Duties**: Administrators oversee infrastructure health but possess zero capability to decrypt clinical records.
12. **Defense in Depth**: JWT sessions, Zod runtime input validation, rate limiting, and resource-level database ownership checks.
13. **Cryptographically Secure Randomness**: All keys, nonces, and initialization vectors are generated using cryptographically secure PRNGs (`crypto.getRandomValues`).
14. **No Custom Cryptography**: Built exclusively on audited standards (AES-256-GCM, SHA-256, Ed25519, HKDF).
15. **Explicit Revocation Limitations**: Clear communication of the physical boundaries of cryptographic revocation.

---

## 2. Cryptographic Envelope Lifecycle

```
1. Ingestion Phase:
   [Plaintext File] + [256-bit Random DEK] + [96-bit Random IV]
          |
          v (AES-256-GCM)
   [Ciphertext Payload] ---> (Store in Content-Addressed IPFS Engine) ---> Returns CID

2. Envelope Wrapping Phase:
   [DEK] + [Patient Public KEK] ---> [Wrapped Patient Envelope] (Stored in DB)

3. Consent Granting Phase:
   [DEK] + [Doctor Public Key] ---> [Wrapped Doctor Envelope] (Stored in DB + Logged On-Chain)

4. Decryption Phase (Authorized Doctor):
   [Ciphertext from CID] + [Doctor Private Key Unwraps DEK] ---> Decrypted in Client Memory
```

---

## 3. Regulatory Disclaimers

> [!WARNING]
> **Academic Prototype Notice**: MEDCHAIN is an educational and research implementation. While implementing high-grade cryptographic protocols, it has not undergone independent third-party penetration testing or official certification for HIPAA, GDPR, or India's DPDP Act. It must be evaluated exclusively using synthetic medical data.
