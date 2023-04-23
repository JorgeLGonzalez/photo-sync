import { Injectable, Logger } from '@nestjs/common';
import {
  IGoogleMediaItem,
  IGooglePhotoMediaItemsResponse,
} from './google-photos.model';
import path from 'node:path';
import { homedir } from 'node:os';
import { writeFile } from 'node:fs/promises';
import { GooglePhotosAuthorizer } from './GooglePhotosAuthorizer';

@Injectable()
export class GooglePhotoDownloader {
  private readonly logger = new Logger(GooglePhotoDownloader.name);

  public constructor(private readonly auth: GooglePhotosAuthorizer) {}

  public async download(albumId: string): Promise<void> {
    const photos = await this.downloadPage(albumId);

    const filePath = path.join(homedir(), 'Downloads/google-photos.json');
    await writeFile(filePath, JSON.stringify(photos));
    this.logger.log(`Saved ${photos.length} to ${filePath}`);
  }

  private async downloadPage(
    albumId: string,
    pageToken?: string,
  ): Promise<IGoogleMediaItem[]> {
    this.logger.log(`Fetching page of Google photos from album`);

    const res = await fetch(
      'https://photoslibrary.googleapis.com/v1/mediaItems:search',
      {
        headers: {
          Authorization: this.auth.authorization,
        },
        body: JSON.stringify({
          albumId,
          pageSize: 100,
          pageToken,
        }),
        method: 'POST',
      },
    );

    const mediaRes: IGooglePhotoMediaItemsResponse = await res.json();
    this.logger.log(`Got ${mediaRes.mediaItems.length} items`);

    if (mediaRes.nextPageToken) {
      return mediaRes.mediaItems.concat(
        await this.downloadPage(albumId, mediaRes.nextPageToken),
      );
    }

    return mediaRes.mediaItems;
  }
}
