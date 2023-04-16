import { Module } from '@nestjs/common';
import { OneDriveController } from './OneDrive.controller';
import { OneDriveApi } from './OneDriveApi';

@Module({
  controllers: [OneDriveController],
  exports: [OneDriveApi],
  providers: [OneDriveApi],
})
export class OneDriveModule {}
