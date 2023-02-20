import { Readable } from 'node:stream';

export interface IGooglePhotoItem {
  id: string;
  name: string;
  photoDate: string;
  productUrl: string;
}

export interface IPhotoRecord {
  description: string;
  google?: IGooglePhotoItem;
  id: string;
  image: { height: number; width: number };
  lastModifiedDateTime: string;
  mimeType: string;
  name: string;
  photoDate: string;
  size: number;
  webUrl: string;
}

export interface IPhotoRepo {
  creationDate: string;
  records: IPhotoRecord[];
  updateDate: string;
}

export interface IPhotoTransferInfo {
  description: string;
  id: string;
  mimeType: string;
  stream: Readable;
  uniqueName: string;
}
