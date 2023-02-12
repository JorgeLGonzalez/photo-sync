import { Module } from '@nestjs/common';
import { GooglePhotosController } from './GooglePhotos.controller';
import { GooglePhotosApi } from './GooglePhotosApi';

@Module({
  controllers: [GooglePhotosController],
  exports: [GooglePhotosApi],
  providers: [GooglePhotosApi],
})
export class GooglePhotosModule {}
