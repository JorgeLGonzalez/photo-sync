import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfig } from './config/createAppConfig';
import { PhotoRepoModule } from './photo-repo/PhotoRepo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [createAppConfig] }),
    PhotoRepoModule,
  ],
})
export class AppModule {}
