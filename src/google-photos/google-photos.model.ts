export interface IGoogleMediaMetadata {
  creationTime: string;
  height: string;
  width: string;
  photo?: unknown;
}

export interface IGoogleMediaItem {
  description?: string;
  filename: string;
  mediaMetadata: IGoogleMediaMetadata;
  id: string;
  mimeType: string;
  productUrl: string;
}

export interface IGoogleNewMediaItemResult {
  mediaItem: IGoogleMediaItem;
  status: { message: string };
  uploadToken: string;
}

export interface IGoogleBatchCreateResponse {
  newMediaItemResults: IGoogleNewMediaItemResult[];
}

export interface IGooglePhotoMediaItemsResponse {
  mediaItems: IGoogleMediaItem[];
  nextPageToken: string;
}
