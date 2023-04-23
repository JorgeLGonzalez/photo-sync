import { Controller, Get, Query } from '@nestjs/common';
import { GooglePhotosAuthorizer } from './GooglePhotosAuthorizer';

@Controller('google-photos')
export class GooglePhotosController {
  public constructor(private readonly auth: GooglePhotosAuthorizer) {}

  @Get('oauth2-callback')
  public async getOauth2Callback(
    @Query('code') code: string,
  ): Promise<unknown> {
    await this.auth.saveToken(code);

    return { message: 'Token saved' };
  }
}
