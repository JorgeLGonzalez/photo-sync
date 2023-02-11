import { Module } from '@nestjs/common';
import { GooglePhotosController } from './GooglePhotos.controller';

@Module({
  controllers: [GooglePhotosController],
})
export class GooglePhotosModule {}
