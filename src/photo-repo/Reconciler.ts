import { Injectable, Logger } from '@nestjs/common';
import { PhotoRepo } from './PhotoRepo';
import { readFileSync } from 'fs';
import { GooglePhotoDownloader } from 'src/google-photos/GooglePhotoDownloader';
import { IGoogleMediaItem } from 'src/google-photos/google-photos.model';
import { IGooglePhotoItem, IPhotoRecord } from './photo-repo.model';
import { OneDriveApi } from 'src/one-drive/OneDriveApi';

@Injectable()
export class Reconciler {
  private readonly logger = new Logger(Reconciler.name);

  public constructor(
    private readonly oneDriveApi: OneDriveApi,
    private readonly repo: PhotoRepo,
  ) {}

  public async reconcile(): Promise<void> {
    const db = await this.repo.loadRepo();
    // assume this was recently downloaded via GooglePhotoDownloader
    const filePath = GooglePhotoDownloader.FilePath;
    const googlePhotos: IGoogleMediaItem[] = JSON.parse(
      readFileSync(filePath, 'utf8'),
    );
    this.logger.log(
      `Loaded ${googlePhotos.length} google photos from ${filePath}`,
    );

    const missing = db.records.filter((r) => !r.google);
    this.logger.log(`${missing.length} records unmapped to google`);

    const googleMap = new Map<string, IGoogleMediaItem>(
      googlePhotos.map((p) => [p.filename, p]),
    );

    db.records = db.records.map((r) => ({
      ...r,
      google: this.createGooglePhotoItemMaybe(
        this.oneDriveApi.createUniqueName(r.id, r.name),
        googleMap,
      ),
    }));

    const stillMissing = db.records.filter((r) => !r.google);
    this.logger.warn(`${stillMissing.length} could not be mapped to google`);

    await this.repo.writeRepo(db);

    const dbMap = new Map<string, IPhotoRecord>(
      db.records.map((r) => [
        this.oneDriveApi.createUniqueName(r.id, r.name),
        r,
      ]),
    );
    const xtra = googlePhotos.filter((p) => !dbMap.has(p.filename));
    console.log(`In google but not in DB: ${xtra.length}`);
    // const oneSansPipe = db.records.filter((r) => !r.id.includes('!'));
    // const pipeSplit = googlePhotos.filter(
    //   (p) => p.filename.includes('!') && p.filename.split('|').length > 1,
    // );
    // const noBang = googlePhotos.filter((p) => !p.filename.includes('!'));
    // const dashSplit = googlePhotos.filter(
    //   (p) => p.filename.includes('!') && p.filename.split('-').length > 1,
    // );
    // console.log(noBang);
    // console.log({
    //   oneSansPipe: oneSansPipe.length,
    //   dashSplit: dashSplit.length,
    //   pipeSplit: pipeSplit.length,
    //   noBang: noBang.length,
    //   total: dashSplit.length + pipeSplit.length + noBang.length,
    // });
    // console.log(stillMissing);
    // console.log(googlePhotos);
  }

  private createGooglePhotoItemMaybe(
    uniqueName: string,
    googleMap: Map<string, IGoogleMediaItem>,
  ): IGooglePhotoItem | undefined {
    const google = googleMap.get(uniqueName);

    return google
      ? {
          id: uniqueName,
          name: google.filename,
          photoDate: google.mediaMetadata.creationTime,
          productUrl: google.productUrl,
        }
      : undefined;
  }
}
