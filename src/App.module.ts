import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfig } from './config/createAppConfig';
import { GooglePhotosModule } from './google-photos/GooglePhotos.module';
import { PhotoRepoModule } from './photo-repo/PhotoRepo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [createAppConfig] }),
    GooglePhotosModule,
    PhotoRepoModule,
  ],
})
export class AppModule {}
