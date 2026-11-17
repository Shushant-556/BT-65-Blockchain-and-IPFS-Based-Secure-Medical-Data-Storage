// MedChain Storage Interface
// Abstract interface for pluggable storage backends

export interface StorageProvider {
  /** Store encrypted data and return a reference ID */
  store(data: Uint8Array, filename: string): Promise<string>;

  /** Retrieve encrypted data by reference */
  retrieve(ref: string): Promise<Uint8Array>;

  /** Delete data by reference */
  delete(ref: string): Promise<void>;

  /** Check if a reference exists */
  exists(ref: string): Promise<boolean>;

  /** Get metadata about stored data */
  getMetadata(ref: string): Promise<StorageMetadata>;
}

export interface StorageMetadata {
  ref: string;
  size: number;
  createdAt: string;
  contentType?: string;
}

/** Factory to get the configured storage provider */
export async function getStorageProvider(): Promise<StorageProvider> {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'ipfs': {
      const { IpfsStorage } = await import('./ipfs-storage');
      return new IpfsStorage();
    }
    case 'local':
    default: {
      const { LocalStorage } = await import('./local-storage');
      return new LocalStorage();
    }
  }
}
