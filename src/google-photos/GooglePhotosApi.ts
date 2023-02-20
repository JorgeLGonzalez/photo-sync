import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { Credentials } from 'google-auth-library';
import got, { RequestError } from 'got';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  IGooglePhotoItem,
  IPhotoTransferInfo,
} from '../photo-repo/photo-repo.model';
import { IAppConfig, IGoogleCredentials } from '../config/config.model';
import { nanoid } from 'nanoid';
import {
  IGoogleBatchCreateResponse,
  IGoogleNewMediaItemResult,
} from './google-photos.model';

const AlbumId =
  'AGhGL1vslTyXdKn0MsVVjqPooakNr94hkp8-ZNzVo4xIw5LC8IN-HXp1rGgI4LS2HLzjU1WMjIKx';

const TokenFilePath = path.join(homedir(), 'Downloads/google-auth-tokens.json');

@Injectable()
export class GooglePhotosApi implements OnModuleInit {
  private get authorization(): string {
    return `Bearer ${this.client.credentials.access_token}`;
  }

  private readonly client: OAuth2Client;

  private readonly logger = new Logger(GooglePhotosApi.name);

  public constructor(configService: ConfigService<IAppConfig, true>) {
    const { clientId, clientSecret } = configService.get('googlePhotos');
    this.client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/google-photos/oauth2-callback',
    );
  }

  public async listAlbums(): Promise<void> {
    const res = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        Authorization: this.authorization,
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

  public async onModuleInit(): Promise<void> {
    if (!existsSync(TokenFilePath)) {
      this.showAuthUrl();

      return;
    }

    const tokens: IGoogleCredentials = JSON.parse(
      await readFile(TokenFilePath, 'utf-8'),
    );

    const expiration = new Date(tokens.expiry_date);
    this.client.setCredentials(tokens);

    if (tokens.expiry_date > Date.now()) {
      this.logger.log(`Credentials will expire on ${expiration}`);

      return;
    }

    this.logger.log(`Credentials expired on ${expiration}. Refreshing...`);
    const res = await this.client.refreshAccessToken();
    this.logger.log('Tokens refreshed. Testing album listing.');
    await this.listAlbums();
    await this.saveCredentials(res.credentials);
  }

  public async saveToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }
    const { tokens } = await this.client.getToken(code);
    await this.saveCredentials(tokens);
  }

  private showAuthUrl(): void {
    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/photoslibrary'],
    });

    setTimeout(() => {
      console.log('\nNeed to get credentials for Google API.');
      console.log(`Go to`, url);
    }, 2000);
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
            Authorization: this.authorization,
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
            Authorization: this.authorization,
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
      this.logger.error(err);
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  private async saveCredentials(credentials: Credentials): Promise<void> {
    await writeFile(TokenFilePath, JSON.stringify(credentials));
    this.logger.log(`Google credentials saved to ${TokenFilePath}`);
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
            Authorization: this.authorization,
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
