import { Module } from '@nestjs/common';
import { OneDriveModule } from 'src/one-drive/OneDrive.module';
import { PhotoRepo } from './PhotoRepo';

@Module({
  imports: [OneDriveModule],
  providers: [PhotoRepo],
})
export class PhotoRepoModule {}
