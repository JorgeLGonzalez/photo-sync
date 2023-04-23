import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';
import { GooglePhotosApi } from 'src/google-photos/GooglePhotosApi';
import { OneDriveApi } from 'src/one-drive/OneDriveApi';
import { IPhotoRecord, IPhotoRepo } from './photo-repo.model';

const PhotoDbFile = path.join(homedir(), 'Documents/photo-db.json');

@Injectable()
export class PhotoRepo implements OnModuleInit {
  private readonly logger = new Logger(PhotoRepo.name);

  public constructor(
    private readonly googleApi: GooglePhotosApi,
    private readonly oneDriveApi: OneDriveApi,
  ) {}

  public async onModuleInit(): Promise<void> {
    if (this.googleApi) {
      await this.googleApi.downloadPhotos();
      return;
    }

    await this.oneDriveApi.authorization;
    const repo = await this.loadRepo();
    const records = await this.oneDriveApi.downloadRecords();
    await this.updateDb(repo, records);

    const missing = repo.records.filter((r) => !r.google);
    this.logger.log(`${missing.length} photos missing from Google Photos`);

    let index = 1;
    for (const record of missing) {
      this.logger.log(`Copying ${record.id} (${index} of ${missing.length})`);
      // await this.transferPhoto(record);

      if (index % 10 === 0) {
        // this.writeRepo(repo);
      }
      index += 1;
    }

    await this.writeRepo(repo);

    this.logger.verbose('All done! Exiting...');
    process.exit(0);
  }

  private async loadRepo(): Promise<IPhotoRepo> {
    try {
      const repo: IPhotoRepo = existsSync(PhotoDbFile)
        ? JSON.parse(await readFile(PhotoDbFile, 'utf8'))
        : {
            creationDate: new Date().toISOString(),
            records: [],
            updateDate: new Date().toISOString(),
          };

      this.logger.log(`Loaded repo from ${PhotoDbFile}`);
      this.logger.log(`Repo has ${repo.records.length} records.`);
      this.logger.log(`Repo last updated on ${new Date(repo.updateDate)}`);

      return repo;
    } catch (err) {
      this.logger.error(`Error loading repo from ${PhotoDbFile}: ${err}`);
      throw err;
    }
  }

  private async transferPhoto(record: IPhotoRecord): Promise<void> {
    try {
      const transferInfo = await this.oneDriveApi.downloadPhoto(record);
      const google = await this.googleApi.uploadPhoto(transferInfo);
      record.google = google;
    } catch (err) {
      this.logger.error(
        `Error transferring ${record.id}|${record.name}: ${
          (err as Error)?.message
        }`,
      );
    }
  }

  private async updateDb(
    repo: IPhotoRepo,
    records: IPhotoRecord[],
  ): Promise<IPhotoRepo> {
    this.logger.log(
      `Updating repo with ${records.length} OneDrive (potentially new/changed) items`,
    );
    const db = repo.records.reduce(
      (map, r) => map.set(r.id, r),
      new Map<string, IPhotoRecord>(),
    );

    records.forEach((r) => {
      const dbRecord = db.get(r.id) ?? r;
      const { google } = dbRecord;

      if (!db.has(r.id)) {
        this.logger.verbose(`Inserted photo ${r.id}`);
      }

      if (dbRecord.lastModifiedDateTime < r.lastModifiedDateTime) {
        this.logger.verbose(
          `Updated modified photo ${r.id} (${r.lastModifiedDateTime})`,
        );
      }

      db.set(r.id, { ...r, google });
    });

    repo.records = [...db.values()];

    await this.writeRepo(repo);

    return repo;
  }

  private async writeRepo(repo: IPhotoRepo): Promise<void> {
    repo.updateDate = new Date().toISOString();
    await writeFile(PhotoDbFile, JSON.stringify(repo));
    this.logger.log(`Wrote ${repo.records.length} records to ${PhotoDbFile}`);
  }
}
