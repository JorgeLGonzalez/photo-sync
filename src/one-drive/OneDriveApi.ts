import {
  AccessToken,
  DeviceCodeCredential,
  DeviceCodeInfo,
  TokenCredential,
} from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import got from 'got';
import { homedir } from 'os';
import path from 'path';
import { IPhotoRecord } from 'src/photo-repo/photo-repo.model';
import { pipeline } from 'stream/promises';
import { IAppConfig } from '../config/config.model';

const scopes = ['user.read', 'mail.read', 'files.read.all'];

const TokenFilePath = path.join(homedir(), 'Downloads/ms-auth-tokens.json');

@Injectable()
export class OneDriveApi implements OnModuleInit {
  private api?: Client;

  private readonly logger = new Logger(OneDriveApi.name);

  public constructor(
    private readonly config: ConfigService<IAppConfig, true>,
  ) {}

  public async downloadPhoto(record: IPhotoRecord): Promise<void> {
    if (!this.api) {
      throw new Error('No API');
    }
    const downloadInfo = await this.api
      .api(
        `/me/drive/items/${record.id}?select=id,@microsoft.graph.downloadUrl`,
      )
      .get();
    const downloadUrl = downloadInfo['@microsoft.graph.downloadUrl'];
    const filePath = path.join(
      homedir(),
      `Downloads/${record.id}-${record.name}`,
    );
    await pipeline(got.stream(downloadUrl), createWriteStream(filePath));
    this.logger.log(`Saved ${record.id} to ${filePath}`);
  }

  public async onModuleInit(): Promise<void> {
    if (existsSync(TokenFilePath)) {
      const token: AccessToken = JSON.parse(
        await readFile(TokenFilePath, 'utf-8'),
      );

      const expiration = new Date(token.expiresOnTimestamp);
      if (token.expiresOnTimestamp > Date.now()) {
        this.logger.log(`Credentials will expire on ${expiration}`);

        this.createApi({ getToken: async () => token });

        return;
      }

      this.logger.log(`Credentials expired on ${expiration}`);
    }

    this.getFreshAuthToken();
  }

  private async getFreshAuthToken(): Promise<void> {
    const { clientId, tenantId } = this.config.get('oneDrive');
    const tokenProvider = new DeviceCodeCredential({
      clientId,
      tenantId,
      userPromptCallback: (info: DeviceCodeInfo) => {
        console.log(info.message);
      },
    });
    this.createApi(tokenProvider);
    const token = await tokenProvider.getToken(scopes);
    await writeFile(TokenFilePath, JSON.stringify(token));
    this.logger.log(`Tokens saved to ${TokenFilePath}`);
  }

  private createApi(tokenProvider: TokenCredential): void {
    const authProvider = new TokenCredentialAuthenticationProvider(
      tokenProvider,
      { scopes: scopes },
    );

    this.api = Client.initWithMiddleware({
      authProvider,
      debugLogging: true,
    });
  }
}
