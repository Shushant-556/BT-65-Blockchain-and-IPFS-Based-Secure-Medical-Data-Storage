# MEDCHAIN Privacy Guarantees & Technical Limitations

This document provides transparent, unvarnished disclosure of the architectural and physical boundaries of decentralized healthcare data storage and cryptography.

---

## 1. The Fundamental Revocation Limitation

A frequent misconception in decentralized healthcare platforms is that smart contract revocation can "delete" or "erase" medical data. 

### The Physical Reality:
When an authorized doctor views a medical record:
1. The ciphertext is fetched from IPFS/storage.
2. The wrapped DEK is unwrapped using the doctor's private key.
3. The document is decrypted in the doctor workstation's browser memory or operating system cache.

If the patient subsequently clicks **"Revoke Consent"**:
- Future key requests are immediately blocked.
- The smart contract logs the revocation event on-chain.
- Future API queries for this doctor will receive `403 Forbidden`.
- **However**, any file already saved, printed, or screenshotted by the doctor prior to the revocation timestamp **cannot be erased remotely**.

MEDCHAIN makes this boundary explicit throughout the user interface and system audit trail.

---

## 2. IPFS Metadata and Traffic Correlation

1. **Content Identifiers (CIDs)**: While ciphertext on IPFS reveals zero clinical text, the public availability of CIDs allows adversaries to observe file sizes and access frequency.
2. **Access Patterns**: If an attacker monitors network traffic, they can correlate IPFS download timestamps with outpatient clinic operating hours, potentially inferring patient-doctor relationships.

---

## 3. Regulatory Compliance Boundaries

> [!IMPORTANT]
> **No Automatic Compliance**: Encryption and blockchain immutability do not inherently constitute compliance with regulations such as:
> - **HIPAA (Health Insurance Portability and Accountability Act)** — Requires physical facility audits, business associate agreements (BAAs), administrative safeguards, and disaster recovery procedures.
> - **GDPR (General Data Protection Regulation)** — Blockchain immutability can directly conflict with Article 17 ("Right to be Forgotten"). MEDCHAIN mitigates this by never placing personal data on-chain; however, formal GDPR certification requires independent legal and security auditing.
> - **DPDP Act (India's Digital Personal Data Protection Act 2023)** — Demands certified consent managers, localized processing, and explicit data fiduciary governance.

MEDCHAIN is an academic and research prototype designed to demonstrate technological feasibility and privacy-preserving primitives.
