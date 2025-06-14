import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';
import { PhotoRepo } from './photo-repo/PhotoRepo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  await app.get(PhotoRepo).sync();
  // uncomment below to run API such as for GooglePhotosController
  // await app.listen(3000);
}
bootstrap();
