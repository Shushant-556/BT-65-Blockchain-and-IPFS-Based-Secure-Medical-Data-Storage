<p align="center">
  <h1 align="center">🏥 MEDCHAIN</h1>
  <p align="center"><strong>Your Health. Your Data. Your Control.</strong></p>
  <p align="center">
    A decentralized, encrypted, and verifiable healthcare data platform built on
    blockchain technology and content-addressed storage.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Solidity-0.8-363636?logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

> [!CAUTION]
> **MEDCHAIN is an educational and research prototype.** It is **NOT** production-ready,
> **NOT** HIPAA/GDPR/DPDP Act compliant, and must **NOT** be used with real patient data.
> Use only synthetic/demo data for testing and learning.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Demo Accounts](#-demo-accounts)
- [Documentation](#-documentation)
- [Security Notice](#-security-notice)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🔍 Overview

MEDCHAIN is a full-stack healthcare data management platform that empowers patients with
true ownership and control over their medical records. It combines modern web technologies
with blockchain immutability and client-side encryption to create a system where:

- **Patients** encrypt records in-browser before upload — no server ever sees plaintext
- **Consent** is granular, revocable, and recorded on-chain for auditability
- **Doctors** receive access through cryptographic key wrapping — not by sharing passwords
- **Integrity** is verified via SHA-256 content hashes and blockchain anchoring
- **Storage** uses content-addressed files (local or IPFS) so records are tamper-evident

### Key Features

| Feature | Description |
|---|---|
| 🔐 Client-Side Encryption | AES-256-GCM encryption happens entirely in the browser |
| ⛓️ Blockchain Audit Trail | Every consent grant/revoke is recorded on a local Hardhat chain |
| 📁 Content-Addressed Storage | Files stored by their CID (SHA-256 hash), with optional IPFS |
| 🔑 Envelope Encryption | Each file gets a unique DEK, wrapped per authorized recipient |
| ✍️ Digital Signatures | Ed25519 signatures prove record authenticity and authorship |
| 📊 Role-Based Dashboards | Tailored UI for patients, doctors, hospitals, and administrators |
| 🕐 Version History | Full version tracking with immutable audit logs |
| 🛡️ Zero-Knowledge Server | The server stores only ciphertext — never plaintext medical data |

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  React UI    │  │  Crypto      │  │  Key Management        │  │
│  │  (Next.js)   │  │  Module      │  │  (IndexedDB / Memory)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬───────────┘  │
│         │                 │                        │              │
│         └─────────────────┴────────────────────────┘              │
│                           │ HTTPS (encrypted payloads)           │
└───────────────────────────┼──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API SERVER                           │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  Auth     │  │  Records   │  │  Consent   │  │  Audit      │  │
│  │  Routes   │  │  Routes    │  │  Routes    │  │  Routes     │  │
│  └────┬─────┘  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘  │
│       └───────────────┴───────────────┴────────────────┘         │
│                           │                                      │
│       ┌───────────────────┼───────────────────┐                  │
│       ▼                   ▼                   ▼                  │
│  ┌─────────┐      ┌────────────┐      ┌────────────────┐        │
│  │ SQLite  │      │ Encrypted  │      │ Hardhat Local  │        │
│  │ (Prisma)│      │ File Store │      │ Blockchain     │        │
│  └─────────┘      └────────────┘      └────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

> For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | Server-side rendering, routing, API routes |
| **UI** | Tailwind CSS + shadcn/ui | Component library and styling |
| **State** | Zustand + React Query | Client state and server-state management |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Database** | SQLite via Prisma ORM | Lightweight relational storage |
| **Encryption** | Web Crypto API | AES-256-GCM, key derivation |
| **Signatures** | @noble/ed25519 | Digital signatures for records |
| **Hashing** | @noble/hashes | SHA-256 content hashing, HKDF |
| **Blockchain** | Solidity + Hardhat + ethers.js | Smart contracts, local chain |
| **Storage** | Local filesystem / IPFS (optional) | Content-addressed file storage |
| **Auth** | JWT (jose) + bcryptjs | Stateless authentication |
| **Animation** | Framer Motion | UI transitions and micro-interactions |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `>= 18.0.0` — [Download](https://nodejs.org/)
- **npm** `>= 9.0.0` (ships with Node.js)
- **Git** — [Download](https://git-scm.com/)

Optional (for IPFS mode):
- **IPFS Kubo** `>= 0.20.0` — [Download](https://docs.ipfs.tech/install/command-line/)

> [!NOTE]
> MEDCHAIN is designed to run on modest hardware (8 GB RAM, 256 GB SSD).
> SQLite and Hardhat's in-process node keep everything lightweight — no external
> databases or blockchain nodes are required for development.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/medchain.git
cd medchain

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings (defaults work for local dev)

# 4. Initialize the database
npx prisma generate
npx prisma db push

# 5. Seed demo data (optional but recommended)
npm run db:seed

# 6. Deploy smart contracts to local Hardhat node
npx hardhat node &          # Start local blockchain (background)
npx hardhat run scripts/deploy.ts --network localhost

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> For a single-command start after initial setup:
> ```bash
> npm run dev
> ```
> The dev server starts Hardhat's in-process node automatically when configured
> with `HARDHAT_NETWORK=hardhat` in `.env.local`.

---

## 📂 Project Structure

```
medchain/
├── docs/                          # 📚 Project documentation
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── THREAT_MODEL.md
│   ├── CRYPTOGRAPHY.md
│   ├── KEY_MANAGEMENT.md
│   ├── BLOCKCHAIN.md
│   ├── IPFS.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── PRIVACY_LIMITATIONS.md
│   ├── CONTRIBUTING.md
│   └── IMPLEMENTATION_PLAN.md
├── contracts/                     # ⛓️ Solidity smart contracts
│   ├── MedChainAccessControl.sol
│   ├── ConsentManager.sol
│   ├── RecordRegistry.sol
│   └── AuditTrail.sol
├── src/
│   ├── app/                       # 📱 Next.js App Router pages
│   │   ├── (auth)/                #    Authentication pages
│   │   ├── (dashboard)/           #    Role-based dashboards
│   │   │   ├── patient/
│   │   │   ├── doctor/
│   │   │   ├── hospital/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx               #    Landing page
│   ├── components/
│   │   ├── ui/                    #    shadcn/ui components
│   │   ├── layout/                #    Sidebar, header, navigation
│   │   ├── shared/                #    Data tables, skeletons, etc.
│   │   ├── crypto/                #    Encryption UI components
│   │   ├── records/               #    Medical record components
│   │   ├── consent/               #    Consent management UI
│   │   └── blockchain/            #    Blockchain viewer components
│   ├── lib/
│   │   ├── crypto/                # 🔐 Encryption & signatures
│   │   ├── blockchain/            # ⛓️ Contract interaction
│   │   ├── storage/               # 📦 File storage abstraction
│   │   ├── auth/                  # 🔑 Authentication utilities
│   │   ├── db/                    # 🗄️ Database client & queries
│   │   └── utils/                 # 🔧 Shared utilities
│   ├── hooks/                     # ⚡ React custom hooks
│   ├── stores/                    # 📊 Zustand state stores
│   └── types/                     # 📝 TypeScript type definitions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Demo data seeder
├── scripts/                       # 🛠️ Deployment & utility scripts
├── test/                          # 🧪 Test suites
├── hardhat.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:reset` | Reset database and re-seed |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npx hardhat compile` | Compile Solidity contracts |
| `npx hardhat test` | Run smart contract tests |
| `npx hardhat node` | Start local blockchain node |

---

## 👤 Demo Accounts

After running `npm run db:seed`, the following accounts are available:

| Role | Name | Email | Password |
|---|---|---|---|
| 🏥 Patient | Aarav Sharma | patient@medchain.demo | `Demo@123` |
| 🩺 Doctor | Dr. Priya Patel | doctor@medchain.demo | `Demo@123` |
| 🏛️ Hospital | City General Hospital | hospital@medchain.demo | `Demo@123` |
| ⚙️ Admin | System Administrator | admin@medchain.demo | `Demo@123` |

> [!WARNING]
> These demo accounts use weak passwords intentionally for testing convenience.
> Never use such passwords in any real environment.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System design, data flows, component diagrams |
| [Security](docs/SECURITY.md) | Security model, auth, encryption overview |
| [Threat Model](docs/THREAT_MODEL.md) | 15 threat scenarios with mitigations |
| [Cryptography](docs/CRYPTOGRAPHY.md) | Encryption protocols, key derivation, signatures |
| [Key Management](docs/KEY_MANAGEMENT.md) | Key lifecycle: generation, storage, rotation, revocation |
| [Blockchain](docs/BLOCKCHAIN.md) | Smart contracts, on-chain vs off-chain design |
| [IPFS / Storage](docs/IPFS.md) | Content-addressed storage, CIDs, pinning |
| [API Reference](docs/API_DOCUMENTATION.md) | REST API endpoints, schemas, error codes |
| [Database](docs/DATABASE.md) | ER diagrams, table schemas, indexes |
| [Testing](docs/TESTING.md) | Test strategy, running tests, coverage |
| [Deployment](docs/DEPLOYMENT.md) | Setup guide, environment variables, deployment |
| [Privacy Limitations](docs/PRIVACY_LIMITATIONS.md) | Honest limitations and compliance gaps |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute to the project |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Development phases and tracking |

---

## 🔒 Security Notice

MEDCHAIN implements several security measures for educational purposes:

- ✅ Client-side AES-256-GCM encryption
- ✅ Envelope encryption with per-file DEKs
- ✅ Ed25519 digital signatures
- ✅ JWT-based authentication with httpOnly cookies
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod schemas
- ✅ Rate limiting on sensitive endpoints
- ✅ Content Security Policy headers
- ✅ Blockchain-anchored audit trail

**However, this is a research prototype with known limitations:**

- ❌ No formal security audit has been performed
- ❌ Not compliant with HIPAA, GDPR, or India's DPDP Act
- ❌ Key management relies on browser storage (vulnerable to XSS)
- ❌ Consent revocation cannot erase previously downloaded data
- ❌ Metadata (file sizes, timestamps, access patterns) may leak information
- ❌ Smart contracts have not been formally verified

See [Privacy Limitations](docs/PRIVACY_LIMITATIONS.md) and [Threat Model](docs/THREAT_MODEL.md)
for comprehensive analysis.

---

## 📸 Screenshots

> Screenshots will be added once the UI is fully implemented.
>
> Planned screenshots:
> - Landing page
> - Patient dashboard
> - Encrypted upload flow
> - Consent management panel
> - Doctor's patient view
> - Blockchain transaction viewer
> - Admin audit logs

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 MEDCHAIN Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built with ❤️ for healthcare data sovereignty
  <br />
  <strong>MEDCHAIN</strong> — Your Health. Your Data. Your Control.
</p>
