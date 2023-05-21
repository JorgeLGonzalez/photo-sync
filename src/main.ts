import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';
import { PhotoRepo } from './photo-repo/PhotoRepo';
import { AlbumCopier } from './one-drive/AlbumCopier';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  if (!app.get(PhotoRepo)) throw new Error('wtf');
  await app.get(AlbumCopier).copy();
}
bootstrap();
