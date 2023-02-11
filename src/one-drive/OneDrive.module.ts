import { Module } from '@nestjs/common';
import { OneDriveApi } from './OneDriveApi';

@Module({
  providers: [OneDriveApi],
})
export class OneDriveModule {}
