import { PhotoRepo } from 'src/photo-repo/PhotoRepo';
import { OneDriveApi } from './OneDriveApi';
import { chunk } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Temp class for one-time copy of all photos from the legacy album that stopped
 * working onto a new album.
 */

@Injectable()
export class AlbumCopier {
  private readonly logger = new Logger(AlbumCopier.name);

  public constructor(
    private readonly facade: OneDriveApi,
    private readonly repo: PhotoRepo,
  ) {}

  public async copy(): Promise<void> {
    // const repo = await this.repo.syncDown();
    await this.facade.authorization;
    const repo = await this.repo.loadRepo();

    const chunks = chunk(repo.records, 100);

    const album = '/me/drive/items/2A6D8CEFB23FAC76%2150624/children';

    for (const batch of chunks) {
      await Promise.all(
        batch
          .map(({ id }) => ({ id }))
          .map(async (item) => {
            const result = await this.facade.api.api(album).post(item);
            this.logger.verbose(`Copied ${item.id} to Selections: ${result}`);
          }),
      );
    }
  }
}
