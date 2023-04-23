import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { IAppConfig, IGoogleCredentials } from 'src/config/config.model';
import { OAuth2Client } from 'googleapis-common';
import { Credentials } from 'google-auth-library';

const TokenFilePath = path.join(homedir(), 'Downloads/google-auth-tokens.json');

@Injectable()
export class GooglePhotosAuthorizer implements OnModuleInit {
  public get authorization(): string {
    return `Bearer ${this.client.credentials.access_token}`;
  }

  private readonly client: OAuth2Client;

  private readonly logger = new Logger(GooglePhotosAuthorizer.name);

  public constructor(configService: ConfigService<IAppConfig, true>) {
    const { clientId, clientSecret } = configService.get('googlePhotos');
    this.client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/google-photos/oauth2-callback',
    );
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
    // await this.listAlbums();
    await this.saveCredentials(res.credentials);
  }

  public async saveToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }
    const { tokens } = await this.client.getToken(code);
    await this.saveCredentials(tokens);
  }

  private async saveCredentials(credentials: Credentials): Promise<void> {
    await writeFile(TokenFilePath, JSON.stringify(credentials));
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
}
