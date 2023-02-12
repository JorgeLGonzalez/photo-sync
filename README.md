# Photo Sync

Synchronize photos between the main Album in OneDrive and Google Photos.

Next steps:

- Resolve error uploading to album. Think album needs to be created by app to get proper rights. "[Media items can only be added to albums created by your app.](https://developers.google.com/photos/library/guides/upload-media)"
- Once we can upload all photos. Either we optimistically add to photo record or we verify at end. Not sure what happens with duplicates.
  - test all this out with a small batch
- At startup, it should download all photos from 1drive (or ideally just those modified/created since prior attempt). Then save DB. Should download from google as well and reconcile. Then check for missing.

[Google upload](https://developers.google.com/photos/library/guides/upload-media)
[Add to Google Album](https://developers.google.com/photos/library/reference/rest/v1/albums/batchAddMediaItems)

- Can we extend expiration of auth tokens? By how much?
- convert to esm

Other TODO

- Improve auth stuff. If credentials expired or absent, google api still tries to do stuff. MS should improve way to refresh expired token.
- Debug not working
