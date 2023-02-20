import { Module } from '@nestjs/common';
import { GooglePhotosModule } from '../google-photos/GooglePhotos.module';
import { OneDriveModule } from '../one-drive/OneDrive.module';
import { PhotoRepo } from './PhotoRepo';

@Module({
  imports: [GooglePhotosModule, OneDriveModule],
  providers: [PhotoRepo],
})
export class PhotoRepoModule {}
