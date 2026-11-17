// MedChain IPFS Storage
// Store encrypted records on IPFS

import { v4 as uuidv4 } from 'uuid';
import type { StorageProvider, StorageMetadata } from './interface';
import { IPFS_API_URL, IPFS_GATEWAY_URL } from '@/lib/constants';

export class IpfsStorage implements StorageProvider {
  private apiUrl: string;
  private gatewayUrl: string;

  constructor(apiUrl?: string, gatewayUrl?: string) {
    this.apiUrl = apiUrl || IPFS_API_URL;
    this.gatewayUrl = gatewayUrl || IPFS_GATEWAY_URL;
  }

  async store(data: Uint8Array, filename: string): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([data as any], { type: 'application/octet-stream' });
    formData.append('file', blob, filename);

    const response = await fetch(`${this.apiUrl}/api/v0/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.Hash as string; // CID
  }

  async retrieve(ref: string): Promise<Uint8Array> {
    const response = await fetch(`${this.gatewayUrl}/ipfs/${ref}`);
    if (!response.ok) {
      throw new Error(`IPFS retrieval failed: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async delete(_ref: string): Promise<void> {
    // IPFS is content-addressed — we can only unpin
    try {
      await fetch(`${this.apiUrl}/api/v0/pin/rm?arg=${_ref}`, {
        method: 'POST',
      });
    } catch {
      // Unpinning is best-effort
    }
  }

  async exists(ref: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.gatewayUrl}/ipfs/${ref}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getMetadata(ref: string): Promise<StorageMetadata> {
    const response = await fetch(`${this.apiUrl}/api/v0/object/stat?arg=${ref}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`IPFS metadata failed: ${response.statusText}`);
    }

    const stats = await response.json();
    return {
      ref,
      size: stats.CumulativeSize || 0,
      createdAt: new Date().toISOString(),
    };
  }

  /** Get the gateway URL for a CID */
  getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }
}
