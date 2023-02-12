import { Readable } from 'node:stream';

export interface IGooglePhotoItem {
  id: string;
  name: string;
  productUrl: string;
  photoDate: string;
}

export interface IPhotoRecord {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  photoDate: string;
  google?: IGooglePhotoItem;
}

export interface IPhotoRepo {
  records: IPhotoRecord[];
}

export interface IPhotoTransferInfo {
  description: string;
  id: string;
  mimeType: string;
  stream: Readable;
  uniqueName: string;
}
