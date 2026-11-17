# MEDCHAIN Deployment & Reproduction Guide

This guide provides reproducible instructions for running MEDCHAIN on local workstations (including resource-constrained 8GB RAM laptops) as well as Docker-supported environments.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (tested on v24.14.1)
- **Package Manager**: npm v9+ (or pnpm/yarn)
- **Operating System**: Windows, macOS, or Linux
- **RAM Footprint**: ~350 MB (Zero daemon requirement)
- **Disk Space**: ~450 MB (including local database and cached dependencies)

---

## 2. Quick Start (Zero-Docker Lightweight Mode)

### Step 1: Install Dependencies
```bash
cd medchain
npm install --legacy-peer-deps
```

### Step 2: Database Initialization & Seeding
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 3: Compile Smart Contracts
```bash
cd contracts
npm install --legacy-peer-deps
npx hardhat compile
cd ..
```

### Step 4: Launch Dev Server
```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

---

## 3. Demo Persona Accounts

All accounts are pre-seeded with the password: `Demo@123`

| Role | Persona Name | Email | Description |
|---|---|---|---|
| **Patient** | Sarah Jenkins | `patient@medchain.demo` | Primary patient with 4 pre-loaded medical records and 1 active consent grant. |
| **Patient 2** | Michael Chen | `patient2@medchain.demo` | Secondary patient for testing cross-patient isolation. |
| **Doctor** | Dr. Robert Vance, MD | `doctor@medchain.demo` | Attending Cardiologist with authorized access to Sarah's vault. |
| **Doctor 2** | Dr. Anya Sharma, MD | `doctor2@medchain.demo` | Radiologist with a pending access request. |
| **Hospital** | Metro Health Admin | `hospital@medchain.demo` | Hospital administrator overseeing doctor affiliations. |
| **Admin** | System Administrator | `admin@medchain.demo` | Platform governance (zero plaintext access). |
