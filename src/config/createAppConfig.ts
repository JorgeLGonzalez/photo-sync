import { IAppConfig } from './config.model';
import { Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';

export async function createAppConfig(): Promise<IAppConfig> {
  const configFile = process.env.CONFIG_FILE;
  if (!configFile) {
    throw new Error(`CONFIG_FILE env var is missing!`);
  }

  const appConfig: IAppConfig = JSON.parse(await readFile(configFile, 'utf-8'));

  Logger.log(`Loaded config from ${configFile}`);

  return appConfig;
}
