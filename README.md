# MediVault — Blockchain + IPFS Medical Data Storage (Frontend Prototype)

This is an initial **frontend-only research prototype** aligned with the Phase-I design for the project. It provides a React dashboard and local interactions for demonstrating the intended user workflow.

## Included in this milestone

- Patient overview dashboard
- Sample medical-record list and search
- Local upload form that adds a demo row to the current page state
- Demo provider permission controls (enable/revoke locally)
- Session-only activity log
- Architecture notes identifying implemented and pending components
- Responsive layout for desktop and mobile

## Important implementation boundary

This version does **not** connect to a blockchain, smart contract, MetaMask, encryption service, backend, or IPFS node. The upload form does not transmit file contents; it only uses the selected file's name and size to create a local demo row. Permission changes and audit events are local UI state, not real authorization or immutable on-chain logs. The sample data is fictional.

Do not upload real patient data. Do not describe this version as a completed secure medical-record system or claim measured security/performance results.

## Requirements

- Node.js 18+ (Node.js 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build check

```bash
npm run build
```

## Suggested next milestones

1. Add a backend/service layer and configuration for a local IPFS node.
2. Implement client-side encryption with a documented key-management approach before sending any file to storage.
3. Add a Solidity smart contract for record references, patient consent, and permission revocation.
4. Connect the frontend to the contract using a wallet library, with explicit handling for pending/rejected transactions.
5. Add integration tests for upload/retrieval, integrity verification, authorization, and error cases.
6. Document actual test results; do not invent benchmarks.

## Suggested repository commit message

`feat: add initial MediVault frontend prototype`
