import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { existsSync, unlinkSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { IAppConfig, IGoogleCredentials } from 'src/config/config.model';
import { OAuth2Client } from 'googleapis-common';
import { Credentials } from 'google-auth-library';
import { differenceInMinutes } from 'date-fns';

const TokenFilePath = path.join(homedir(), 'Downloads/google-auth-tokens.json');

@Injectable()
export class GooglePhotosAuthorizer implements OnModuleInit {
  public get authorization(): string {
    return `Bearer ${this.client.credentials.access_token}`;
  }

  public expiration = new Date();

  private readonly client: OAuth2Client;

  private readonly logger = new Logger(GooglePhotosAuthorizer.name);

  private readonly REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/photoslibrary.appendonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
    'https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata',
  ];

  public constructor(configService: ConfigService<IAppConfig, true>) {
    const { clientId, clientSecret } = configService.get('googlePhotos');
    this.client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/google-photos/oauth2-callback',
    );
  }

  public async getAuthorization(): Promise<string> {
    if (differenceInMinutes(new Date(), this.expiration) > 2) {
      await this.refresh();
    }

    return this.authorization;
  }

  public async onModuleInit(): Promise<void> {
    if (!existsSync(TokenFilePath)) {
      this.showAuthUrl();

      return;
    }

    const tokens: IGoogleCredentials = JSON.parse(
      await readFile(TokenFilePath, 'utf-8'),
    );

    this.expiration = new Date(tokens.expiry_date);
    this.client.setCredentials(tokens);

    if (tokens.expiry_date > Date.now()) {
      this.logger.log(`Credentials will expire on ${this.expiration}`);

      return;
    }

    this.logger.log(`Credentials expired on ${this.expiration}. Refreshing...`);
    await this.refresh();
  }

  public async refresh(): Promise<void> {
    const res = await this.client.refreshAccessToken();
    this.logger.debug('Token scopes:', res.credentials.scope);

    this.expiration = res.credentials.expiry_date
      ? new Date(res.credentials.expiry_date)
      : this.expiration;
    // this.logger.log('Tokens refreshed. Testing album listing.');
    // await this.listAlbums();
    await this.saveCredentials(res.credentials);
    this.logger.log(`Credentials will expire on ${this.expiration}`);
  }

  public async saveToken(code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }
    this.logger.log('Saving Google credentials...');
    const { tokens } = await this.client.getToken(code);
    await this.saveCredentials(tokens);
  }

  private async saveCredentials(credentials: Credentials): Promise<void> {
    await writeFile(TokenFilePath, JSON.stringify(credentials));
    this.logger.log(`Google credentials saved to ${TokenFilePath}`);
  }

  private showAuthUrl(): void {
    this.logger.error(`Recreating token file ${TokenFilePath}`);
    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: this.REQUIRED_SCOPES,
      // Force consent screen to appear
      prompt: 'consent',
      // Include granted scopes and request new ones
      include_granted_scopes: true,
    });

    // Clear any existing credentials
    this.client.setCredentials({});

    // if (existsSync(TokenFilePath)) {
    //   this.logger.log('Removing existing token file...');
    //   unlinkSync(TokenFilePath);
    // }

    setTimeout(() => {
      console.log(
        '\nNeed to get new credentials for Google API with updated scopes.',
      );
      console.log(`Go to`, url);
    }, 2_000);
  }
}
