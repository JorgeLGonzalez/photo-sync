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
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import got from 'got';
import { homedir } from 'os';
import path from 'path';
import {
  IPhotoRecord,
  IPhotoTransferInfo,
} from 'src/photo-repo/photo-repo.model';
import { IAppConfig } from '../config/config.model';
import { IOneDriveItem, IOneDriveQueryResult } from './one-drive.model';

const scopes = [
  // 'user.read',
  // 'mail.read',
  // 'files.read.all',
  // 'Files.ReadWrite',
  'Files.ReadWrite.All',
];
const TokenFilePath = path.join(homedir(), 'Downloads/ms-auth-tokens.json');

type IDownloadSubset = Pick<
  IOneDriveItem,
  '@microsoft.graph.downloadUrl' | 'description' | 'file' | 'id' | 'name'
>;

@Injectable()
export class OneDriveApi implements OnModuleInit {
  public get api(): Client {
    if (!this._api) throw new Error('API not initialized');
    return this._api;
  }
  private _api?: Client;

  public readonly authorization: Promise<void>;

  private authorized = (): void => undefined;

  private readonly logger = new Logger(OneDriveApi.name);

  public constructor(private readonly config: ConfigService<IAppConfig, true>) {
    this.authorization = new Promise((r) => {
      this.authorized = r;
    });
  }

  public createUniqueName(id: string, name: string): string {
    return [id, name].join('|');
  }

  public async downloadPhoto(
    record: IPhotoRecord,
  ): Promise<IPhotoTransferInfo> {
    if (!this.api) {
      throw new Error('No API');
    }
    const downloadInfo: IDownloadSubset = await this.api
      .api(
        `/me/drive/items/${record.id}` +
          '?select=@microsoft.graph.downloadUrl,description,id,file,name',
      )
      .get();
    this.logger.verbose(
      `Download photo from OneDrive: ${downloadInfo.id}_${downloadInfo.name}`,
    );

    return {
      description: downloadInfo.description,
      id: downloadInfo.id,
      mimeType: downloadInfo.file.mimeType,
      stream: got.stream(downloadInfo['@microsoft.graph.downloadUrl']),
      uniqueName: this.createUniqueName(downloadInfo.id, downloadInfo.name),
    };
  }

  public async downloadRecords(
    album = '/me/drive/items/2A6D8CEFB23FAC76%2150624/children',
  ): Promise<IPhotoRecord[]> {
    return await this.downloadPage(album);
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
        this.authorized();

        return;
      }

      this.logger.log(`Credentials expired on ${expiration}`);
    }

    this.getFreshAuthToken();
  }

  private async downloadPage(req: string): Promise<IPhotoRecord[]> {
    const result: IOneDriveQueryResult = await this.api
      .api(req)
      .select('id,name,size,webUrl,photo,lastModifiedDateTime,file,description')
      .top(999)
      .get();

    this.logger.log(
      [
        'Found',
        result['@odata.count'],
        'photos in the "selections" album',
      ].join(' '),
    );
    this.logger.log(`Got ${result.value.length} in this page`);

    const page = result.value.map(
      (item: IOneDriveItem): IPhotoRecord => ({
        description: item.description,
        id: item.id,
        image: item.image,
        lastModifiedDateTime: item.lastModifiedDateTime,
        mimeType: item.file.mimeType,
        name: item.name,
        photoDate: item.photo.takenDateTime,
        size: item.size,
        webUrl: item.webUrl,
      }),
    );

    // console.log('page', JSON.stringify(result.value, undefined, 2));

    const nextReq = result['@odata.nextLink'];
    if (!nextReq) return page;

    console.log('skipToken', result['@odata.nextLink']);
    return page.concat(await this.downloadPage(nextReq));
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

    this.authorized();
  }

  private createApi(tokenProvider: TokenCredential): void {
    const authProvider = new TokenCredentialAuthenticationProvider(
      tokenProvider,
      { scopes },
    );

    this._api = Client.initWithMiddleware({
      authProvider,
      debugLogging: true,
    });
  }
}
