import { Readable } from 'stream';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface SaveFileParams {
  buffer: Buffer;
  originalName: string;
  referenceTable: string;
  referenceId: number;
}

export interface StoredFileLocation {
  storedName: string;
  storagePath: string;
}

/**
 * Storage backend contract. `storagePath` is an internal key only meaningful
 * to the provider that produced it (local relative path today, an object key
 * if a provider like S3 is added later) — never exposed to the frontend.
 */
export interface IStorageProvider {
  save(params: SaveFileParams): Promise<StoredFileLocation>;
  delete(storagePath: string): Promise<void>;
  getStream(storagePath: string): Promise<Readable>;
}
