import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';
import { IPhotoRepo } from './photo-repo.model';

const PhotoDbFile = path.join(homedir(), 'Documents/photo-db.json');

@Injectable()
export class PhotoRepo implements OnModuleInit {
  private readonly logger = new Logger(PhotoRepo.name);

  public async onModuleInit(): Promise<void> {
    const repo: IPhotoRepo = JSON.parse(await readFile(PhotoDbFile, 'utf-8'));
    this.logger.log(`Loaded repo from ${PhotoDbFile}`);

    const missing = repo.records.filter((r) => !r.google);
    this.logger.log(`${missing.length} photos missing from Google Photos`);
  }
}
