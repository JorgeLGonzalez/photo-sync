import { Module } from '@nestjs/common';
import { PhotoRepo } from './PhotoRepo';

@Module({
  providers: [PhotoRepo],
})
export class PhotoRepoModule {}
