import {
  AccessToken,
  DeviceCodeCredential,
  DeviceCodeInfo,
} from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import path from 'path';
import { IAppConfig } from '../config/config.model';

const scopes = ['user.read', 'mail.read', 'files.read.all'];

const TokenFilePath = path.join(homedir(), 'Downloads/ms-auth-tokens.json');

@Injectable()
export class OneDriveApi implements OnModuleInit {
  private readonly api: Client;

  private readonly logger = new Logger(OneDriveApi.name);

  private readonly tokenProvider: DeviceCodeCredential;

  public constructor(config: ConfigService<IAppConfig, true>) {
    const { clientId, tenantId } = config.get('oneDrive');
    this.tokenProvider = new DeviceCodeCredential({
      clientId,
      tenantId,
      userPromptCallback: (info: DeviceCodeInfo) => {
        console.log(info.message);
      },
    });
    const authProvider = new TokenCredentialAuthenticationProvider(
      this.tokenProvider,
      { scopes: scopes },
    );

    this.api = Client.initWithMiddleware({
      authProvider,
      debugLogging: true,
    });
  }

  public async onModuleInit(): Promise<void> {
    if (existsSync(TokenFilePath)) {
      const token: AccessToken = JSON.parse(
        await readFile(TokenFilePath, 'utf-8'),
      );

      const expiration = new Date(token.expiresOnTimestamp);
      if (token.expiresOnTimestamp > Date.now()) {
        this.logger.log(`Credentials will expire on ${expiration}`);

        return;
      }

      this.logger.log(`Credentials expired on ${expiration}`);
    }

    this.getFreshAuthToken();
  }

  private async getFreshAuthToken(): Promise<void> {
    const token = await this.tokenProvider.getToken(scopes);
    await writeFile(TokenFilePath, JSON.stringify(token));
    this.logger.log(`Tokens saved to ${TokenFilePath}`);
  }
}
