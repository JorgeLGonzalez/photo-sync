import { Module } from '@nestjs/common';
import { OneDriveApi } from './OneDriveApi';

@Module({
  exports: [OneDriveApi],
  providers: [OneDriveApi],
})
export class OneDriveModule {}
