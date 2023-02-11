import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfig } from './config/createAppConfig';
import { GooglePhotosModule } from './google-photos/GooglePhotos.module';
import { OneDriveModule } from './one-drive/OneDrive.module';
import { PhotoRepoModule } from './photo-repo/PhotoRepo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [createAppConfig] }),
    GooglePhotosModule,
    OneDriveModule,
    PhotoRepoModule,
  ],
})
export class AppModule {}
