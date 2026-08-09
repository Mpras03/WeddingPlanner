import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { extname, join, posix, resolve } from 'path';
import { Readable } from 'stream';
import {
  IStorageProvider,
  SaveFileParams,
  StoredFileLocation,
} from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly rootDir: string;

  constructor(private readonly configService: ConfigService) {
    this.rootDir = resolve(
      this.configService.get<string>('UPLOAD_DIR') ?? 'uploads',
    );
  }

  async save(params: SaveFileParams): Promise<StoredFileLocation> {
    const storedName = `${randomUUID()}${extname(params.originalName)}`;
    const storagePath = posix.join(
      params.referenceTable,
      String(params.referenceId),
      storedName,
    );

    await mkdir(this.absolutePath(posix.dirname(storagePath)), {
      recursive: true,
    });
    await writeFile(this.absolutePath(storagePath), params.buffer);

    return { storedName, storagePath };
  }

  async delete(storagePath: string): Promise<void> {
    await rm(this.absolutePath(storagePath), { force: true });
  }

  getStream(storagePath: string): Promise<Readable> {
    return Promise.resolve(createReadStream(this.absolutePath(storagePath)));
  }

  private absolutePath(storagePath: string): string {
    return join(this.rootDir, ...storagePath.split('/'));
  }
}
