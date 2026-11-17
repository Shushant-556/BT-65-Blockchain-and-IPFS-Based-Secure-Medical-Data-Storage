# Contributing to MEDCHAIN

Thank you for your interest in contributing to MEDCHAIN. As an educational and research platform, contributions advancing privacy-preserving healthcare, post-quantum cryptography, and FHIR interoperability are welcome.

---

## Code of Conduct

1. **Synthetic Data Exclusively**: Never commit real patient health data, identifiable clinical documents, or proprietary keys.
2. **Cryptographic Standards**: Use audited, standardized cryptographic primitives (W3C WebCrypto API, NIST standards). Never invent custom encryption algorithms.
3. **Strict Separation of Concerns**: Maintain modularity across UI, API routes, database models, and smart contracts.

---

## Development Workflow

1. Fork or branch from `master`.
2. Ensure TypeScript strict mode checks pass:
   ```bash
   npx tsc --noEmit
   ```
3. Ensure Next.js builds cleanly:
   ```bash
   npx next build
   ```
4. Ensure all Solidity contracts compile:
   ```bash
   cd contracts && npx hardhat compile
   ```
5. Submit a pull request describing the architectural enhancements and test coverage.
