import { Controller, Get, Query } from '@nestjs/common';
import { GooglePhotosApi } from './GooglePhotosApi';

@Controller('google-photos')
export class GooglePhotosController {
  public constructor(private readonly api: GooglePhotosApi) {}

  @Get('oauth2-callback')
  public async getOauth2Callback(
    @Query('code') code: string,
  ): Promise<unknown> {
    await this.api.saveToken(code);

    return { message: 'Token saved' };
  }
}
