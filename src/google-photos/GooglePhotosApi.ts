import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { IAppConfig, IGoogleCredentials } from '../config/config.model';

const TokenFilePath = path.join(homedir(), 'Downloads/google-auth-tokens.json');

@Injectable()
export class GooglePhotosApi implements OnModuleInit {
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
        Authorization: `Bearer ${this.client.credentials.access_token}`,
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

        this.client.credentials = tokens;

        return;
      }

      this.logger.log(`Credentials expired on ${expiration}`);
    }

    this.showAuthUrl();
  }

  public async saveToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }

    const { tokens } = await this.client.getToken(code);
    await writeFile(TokenFilePath, JSON.stringify(tokens));
    this.logger.log(`Tokens saved to ${TokenFilePath}`);
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
}
