import { Credentials } from 'google-auth-library';

export interface IGooglePhotosConfig {
  clientId: string;
  clientSecret: string;
}

export interface IAppConfig {
  googlePhotos: IGooglePhotosConfig;
}

export interface IGoogleCredentials extends Credentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}
