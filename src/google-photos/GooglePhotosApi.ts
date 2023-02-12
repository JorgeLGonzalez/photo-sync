import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import got from 'got';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { IPhotoTransferInfo } from '../photo-repo/photo-repo.model';
import { IAppConfig, IGoogleCredentials } from '../config/config.model';

const AlbumId =
  'AGhGL1sp3vIzygfRJw0sid9ySwLa01EkXpeu7QYiihJ0JjVfbwlF6nGY-Pih_bsT42-L8qKNXysa';

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
    console.log('res status', res.statusText);

    console.log(await res.text());
    console.log('res ^^');

    // const json = await res.json();
    // console.log(JSON.stringify(json, undefined, 2));
  }

  public async onModuleInit(): Promise<void> {
    if (existsSync(TokenFilePath)) {
      const tokens: IGoogleCredentials = JSON.parse(
        await readFile(TokenFilePath, 'utf-8'),
      );

      const expiration = new Date(tokens.expiry_date);
      if (tokens.expiry_date > Date.now()) {
        this.logger.log(`Credentials will expire on ${expiration}`);

        this.client.setCredentials(tokens);

        return;
      }

      return;
    }

    this.showAuthUrl();
  }

  public async saveToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }
    const { tokens } = await this.client.getToken(code);

    await writeFile(TokenFilePath, JSON.stringify(tokens));
    this.logger.log(`Google credentials saved to ${TokenFilePath}`);
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

  public async uploadPhoto(info: IPhotoTransferInfo): Promise<void> {
    const { mimeType, stream } = info;
    const uploadToken = await this.uploadBytes(mimeType, stream);
    this.logger.debug(`Upload token ${uploadToken}`);
    await this.createMediaItem(uploadToken, info);
  }

  private async createMediaItem(
    uploadToken: string,
    info: IPhotoTransferInfo,
  ): Promise<void> {
    try {
      const res = await got.post(
        'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate',
        {
          json: {
            // albumId: AlbumId,
            newMediaItems: [
              {
                description: info.description,
                simpleMediaItem: {
                  fileName: info.uniqueName,
                  uploadToken,
                },
              },
            ],
          },
          headers: {
            Authorization: this.authorization,
            'Content-type': 'application/json',
          },
        },
      );

      console.log('Create media status code', res.statusCode);
      console.log('Response', res.body);
    } catch (err) {
      this.logger.error(err);
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
