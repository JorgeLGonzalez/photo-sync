import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { homedir } from 'os';
import path from 'path';
import { IAppConfig, IGoogleCredentials } from 'src/config/config.model';

const TokenFilePath = path.join(homedir(), 'Downloads/google-auth-tokens.json');

@Controller('google-photos')
export class GooglePhotosController {
  private readonly client: OAuth2Client;

  private readonly logger = new Logger(GooglePhotosController.name);

  public constructor(configService: ConfigService<IAppConfig, true>) {
    const { clientId, clientSecret } = configService.get('googlePhotos');
    this.client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/google-photos/oauth2-callback',
    );
  }

  @Get('oauth2-callback')
  public async getOauth2Callback(@Query('code') code: string): Promise<void> {
    if (!code) {
      throw new Error('No code!');
    }

    const { tokens } = await this.client.getToken(code);
    await writeFile(TokenFilePath, JSON.stringify(tokens));
    this.logger.log(`Tokens saved to ${TokenFilePath}`);
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

  private showAuthUrl(): void {
    const url = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
    });

    setTimeout(() => {
      console.log('\nNeed to get credentials for Google API.');
      console.log(`Go to`, url);
    }, 2000);
  }
}
