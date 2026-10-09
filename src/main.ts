import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';
import { PhotoRepo } from './photo-repo/PhotoRepo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  if (process.env.AUTH_ONLY === '1') {
    // `npm run auth`: serve the Google OAuth callback on :3000, skip the sync.
    await app.listen(3000);
    return;
  }
  await app.get(PhotoRepo).sync();
}
bootstrap();
