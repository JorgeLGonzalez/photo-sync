import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfig } from './config/createAppConfig';
import { GooglePhotosModule } from './google-photos/GooglePhotos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [createAppConfig] }),
    GooglePhotosModule,
  ],
})
export class AppModule {}
