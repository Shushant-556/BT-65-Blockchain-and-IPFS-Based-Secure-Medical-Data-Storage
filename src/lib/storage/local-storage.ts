// MedChain Local File Storage
// Store encrypted records on the local filesystem (dev/fallback)

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { StorageProvider, StorageMetadata } from './interface';
import { ENCRYPTED_STORAGE_PATH } from '@/lib/constants';

export class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || ENCRYPTED_STORAGE_PATH;
  }

  async store(data: Uint8Array, filename: string): Promise<string> {
    await fs.mkdir(this.basePath, { recursive: true });
    const ref = `${uuidv4()}-${filename}`;
    const filePath = path.join(this.basePath, ref);
    await fs.writeFile(filePath, data);
    return ref;
  }

  async retrieve(ref: string): Promise<Uint8Array> {
    const filePath = path.join(this.basePath, ref);
    const buffer = await fs.readFile(filePath);
    return new Uint8Array(buffer);
  }

  async delete(ref: string): Promise<void> {
    const filePath = path.join(this.basePath, ref);
    await fs.unlink(filePath);
  }

  async exists(ref: string): Promise<boolean> {
    const filePath = path.join(this.basePath, ref);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(ref: string): Promise<StorageMetadata> {
    const filePath = path.join(this.basePath, ref);
    const stats = await fs.stat(filePath);
    return {
      ref,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
    };
  }
}
