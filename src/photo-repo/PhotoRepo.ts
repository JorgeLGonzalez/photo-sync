import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';
import { GooglePhotosApi } from 'src/google-photos/GooglePhotosApi';
import { OneDriveApi } from 'src/one-drive/OneDriveApi';
import { IPhotoRepo } from './photo-repo.model';

const PhotoDbFile = path.join(homedir(), 'Documents/photo-db.json');

@Injectable()
export class PhotoRepo implements OnModuleInit {
  private readonly logger = new Logger(PhotoRepo.name);

  public constructor(
    private readonly googleApi: GooglePhotosApi,
    private readonly oneDriveApi: OneDriveApi,
  ) {}

  public async onModuleInit(): Promise<void> {
    const repo: IPhotoRepo = JSON.parse(await readFile(PhotoDbFile, 'utf-8'));
    this.logger.log(`Loaded repo from ${PhotoDbFile}`);

    const missing = repo.records.filter((r) => !r.google);
    this.logger.log(`${missing.length} photos missing from Google Photos`);

    for (const record of missing.slice(0, 1)) {
      this.logger.log(`Copying ${record.id}`);
      const transferInfo = await this.oneDriveApi.downloadPhoto(record);
      await this.googleApi.uploadPhoto(transferInfo);
    }
  }
}
