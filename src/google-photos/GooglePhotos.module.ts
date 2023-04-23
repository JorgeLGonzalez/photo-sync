import { Module } from '@nestjs/common';
import { GooglePhotosController } from './GooglePhotos.controller';
import { GooglePhotosApi } from './GooglePhotosApi';
import { GooglePhotosAuthorizer } from './GooglePhotosAuthorizer';
import { GooglePhotoDownloader } from './GooglePhotoDownloader';

@Module({
  controllers: [GooglePhotosController],
  exports: [GooglePhotosApi],
  providers: [GooglePhotosApi, GooglePhotosAuthorizer, GooglePhotoDownloader],
})
export class GooglePhotosModule {}
