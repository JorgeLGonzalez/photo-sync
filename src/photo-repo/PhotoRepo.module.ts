import { Module } from '@nestjs/common';
import { GooglePhotosModule } from '../google-photos/GooglePhotos.module';
import { OneDriveModule } from '../one-drive/OneDrive.module';
import { PhotoRepo } from './PhotoRepo';
import { Reconciler } from './Reconciler';
import { AlbumCopier } from 'src/one-drive/AlbumCopier';

@Module({
  imports: [GooglePhotosModule, OneDriveModule],
  providers: [AlbumCopier, PhotoRepo, Reconciler],
})
export class PhotoRepoModule {}
