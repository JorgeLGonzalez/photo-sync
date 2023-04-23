import { HttpStatus, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import got, { HTTPError, RequestError } from 'got';
import { Readable } from 'node:stream';
import {
  IGooglePhotoItem,
  IPhotoTransferInfo,
} from '../photo-repo/photo-repo.model';
import { nanoid } from 'nanoid';
import {
  IGoogleBatchCreateResponse,
  IGoogleNewMediaItemResult,
} from './google-photos.model';
import { GooglePhotosAuthorizer } from './GooglePhotosAuthorizer';
import { GooglePhotoDownloader } from './GooglePhotoDownloader';

const AlbumId =
  'AGhGL1vslTyXdKn0MsVVjqPooakNr94hkp8-ZNzVo4xIw5LC8IN-HXp1rGgI4LS2HLzjU1WMjIKx';

@Injectable()
export class GooglePhotosApi {
  private readonly logger = new Logger(GooglePhotosApi.name);

  public constructor(
    private readonly auth: GooglePhotosAuthorizer,
    private readonly downloader: GooglePhotoDownloader, // configService: ConfigService<IAppConfig, true>,
  ) {}

  public async downloadPhotos(): Promise<void> {
    await this.downloader.download(AlbumId);
  }

  public async listAlbums(): Promise<void> {
    const res = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        Authorization: this.auth.authorization,
      },
    });

    const payload = await res.json();

    if (!res.ok) {
      const info = `status: ${res.status}: ${JSON.stringify(payload)}`;
      this.logger.error(info);
      throw new Error(`Error listing albums: ${info} `);
    }

    this.logger.log(payload);
  }

  public async uploadPhoto(
    info: IPhotoTransferInfo,
  ): Promise<IGooglePhotoItem> {
    const { mimeType, stream } = info;
    this.logger.verbose(`Uploading bytes for ${info.uniqueName}`);
    const uploadToken = await this.uploadBytes(mimeType, stream);
    // this.logger.debug(`Upload token ${uploadToken}`);
    this.logger.verbose(`Creating media item for ${info.uniqueName}`);
    const result = await this.createMediaItem(
      uploadToken,
      info.description,
      info.uniqueName,
    );

    // console.log('google item', result);
    this.logger.verbose(`Created media item ${info.uniqueName}`);

    return {
      id: result.mediaItem.id,
      name: result.mediaItem.filename,
      photoDate: result.mediaItem.mediaMetadata.creationTime,
      productUrl: result.mediaItem.productUrl,
    };
  }

  private async createAlbum(): Promise<void> {
    try {
      const res = await got.post(
        'https://photoslibrary.googleapis.com/v1/albums',
        {
          json: { album: { id: nanoid(), title: 'Selections' } },
          responseType: 'json',
          resolveBodyOnly: true,
          headers: {
            Authorization: await this.auth.getAuthorization(),
            'Content-type': 'application/json',
          },
        },
      );

      console.log(res);
    } catch (err) {
      if (err instanceof RequestError) {
        this.logger.error(err.response?.body);
      }
      this.logger.error(err);
    }
  }

  private async createMediaItem(
    uploadToken: string,
    description: string,
    uniqueName: string,
  ): Promise<IGoogleNewMediaItemResult> {
    try {
      const res = await got.post<IGoogleBatchCreateResponse>(
        'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',
        {
          headers: {
            Authorization: await this.auth.getAuthorization(),
            'Content-type': 'application/json',
          },
          json: {
            albumId: AlbumId,
            newMediaItems: [
              {
                description,
                simpleMediaItem: {
                  fileName: uniqueName,
                  uploadToken,
                },
              },
            ],
          },
          resolveBodyOnly: true,
          responseType: 'json',
        },
      );

      const failures = res.newMediaItemResults
        .map((m) => m.status.message)
        .filter((status) => status !== 'Success');
      if (failures.length) {
        throw new Error(
          `${failures.length} failures with statuses: ${failures.join(',')}`,
        );
      }

      return res.newMediaItemResults[0];
    } catch (err) {
      this.logger.error(`Error creating item: ${err}`);
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  private async uploadBytes(
    mimeType: string,
    photoStream: Readable,
  ): Promise<string> {
    try {
      const res = await got.post(
        'https://photoslibrary.googleapis.com/v1/uploads',
        {
          body: photoStream,
          headers: {
            Authorization: await this.auth.getAuthorization(),
            'Content-type': 'application/octet-stream',
            'X-Goog-Upload-Content-Type': mimeType,
            'X-Goog-Upload-Protocol': 'raw',
          },
        },
      );

      return res.body;
    } catch (err) {
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }
}
