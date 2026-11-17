# MEDCHAIN Decentralized Storage & IPFS Architecture

This document describes the decentralized storage abstraction, CID multihash generation, and pinning management in MEDCHAIN.

---

## 1. Storage Abstraction Layer

To ensure portability between constrained local development environments (e.g. 8GB RAM laptops) and production distributed clusters, MEDCHAIN employs a `StorageProvider` abstraction interface:

```typescript
export interface StorageProvider {
  store(data: Uint8Array, filename: string): Promise<string>; // Returns CID
  retrieve(ref: string): Promise<Uint8Array>;
  delete(ref: string): Promise<void>;
  exists(ref: string): Promise<boolean>;
  getMetadata(ref: string): Promise<StorageMetadata>;
}
```

### Implementations:
1. **Local Encrypted Content Store (`local-storage.ts`)**:
   - Calculates real SHA-256 multihash CIDs (`bafybei...`) matching the IPFS format specification.
   - Saves encrypted ciphertext directly into a dedicated directory (`./storage/encrypted`).
   - Zero background RAM consumption (eliminates 1.5GB+ Docker Kubo daemon overhead).
2. **IPFS Kubo Client Adapter (`ipfs-storage.ts`)**:
   - Connects to an external or local IPFS node via the HTTP RPC API (`/api/v0/add`).
   - Enforces encrypted binary upload before CID generation.

---

## 2. Ingestion & Retrieval Pipeline

```
1. Client Encrypts (AES-256-GCM)
2. Client Generates Binary Payload
3. Storage Provider calculates Multihash CID (e.g. bafybeigdyrzt5sfp7ud...)
4. Storage Engine stores Binary Ciphertext
5. CID returned to Application and anchored to Ethereum Contract
```

---

## 3. IPFS Physical Realities & Limitations

1. **Content Addressing is NOT Automatic Persistence**: Files on IPFS must be pinned or replicated by at least one active node to prevent garbage collection.
2. **Public Retrieval**: In public IPFS networks, anyone possessing the CID can fetch the raw byte payload. **Encryption is therefore strictly non-negotiable**.
3. **No Inherent Access Control in IPFS**: IPFS has no concept of accounts or permissions. Access control is enforced mathematically via cryptographic key wrapping.
