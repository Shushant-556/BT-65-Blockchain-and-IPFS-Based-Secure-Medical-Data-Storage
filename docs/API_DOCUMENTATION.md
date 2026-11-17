# MEDCHAIN REST API Specification

All endpoints reside under `/api/` and return standardized JSON envelopes.

---

## 1. Response Envelopes

### Success:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error:
```json
{
  "success": false,
  "error": "Human readable error description",
  "details": null
}
```

---

## 2. Authentication Headers

Protected routes require an Authorization Bearer token header:
```http
Authorization: Bearer <jwt_session_token>
```

---

## 3. Endpoints Directory

### Authentication (`/api/auth/*`)
- `POST /api/auth/register` — Register new user (`PATIENT`, `DOCTOR`, `HOSPITAL`, `ADMIN`).
- `POST /api/auth/login` — Authenticate with email and password, returning JWT.
- `GET /api/auth/me` — Retrieve active user identity and associated clinical profile.

### Medical Records (`/api/records/*`)
- `GET /api/records` — Query patient records with category filtering and keyword search. Doctors must supply `?patientId=<id>` and hold active consent.
- `POST /api/records` — Register a newly encrypted record metadata, CID, and content hash.
- `GET /api/records/:id` — Fetch record details. Validates resource ownership or active consent.
- `DELETE /api/records/:id` — Soft-delete record reference.
- `POST /api/records/:id/verify` — Run on-demand cryptographic verification comparing payload hash with on-chain anchor. Supports simulated tamper challenge.

### Consent Management (`/api/consent/*`)
- `GET /api/consent/grants` — List active and historical consent grants for current user.
- `POST /api/consent/grants` — Patient authorizes physician with specified scope and expiration.
- `GET /api/consent/requests` — List incoming and outgoing access requests.
- `POST /api/consent/requests` — Doctor requests access specifying clinical purpose and requested scope.
- `POST /api/consent/revoke` — Permanently revoke access grant, deactivating wrapped key envelopes and anchoring revocation on-chain.

### Governance, Blockchain & System Health
- `GET /api/blockchain/transactions` — Query confirmed smart contract transactions and event logs.
- `GET /api/audit` — Query immutable audit events.
- `GET /api/health` — Check status and latency of database, EVM smart contracts, and storage engine.
- `GET /api/stats` — Retrieve role-specific dashboard metrics and storage footprint.
- `GET /api/doctors` — Public directory of verified physicians and hospital affiliations.
