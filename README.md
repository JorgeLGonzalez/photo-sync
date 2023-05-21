# Photo Sync

Synchronize photos between the main Album in OneDrive and Google Photos.
Very rudimentary at the moment.

1. Authenticate with both Microsoft and Google via OAuth2 delegation. `OneDriveApi.onModuleInit` initiates authentication for Microsoft while `GooglePhotosAp.OnModuleInit` does it for Google.
2. `PhotoRepo.onModuleInit` awaits authorization and then:
   - Loads existing `IPhotoRepo` from local JSON (or creates new one)
   - Downloads all photo records (metadata) from the specified album in OneDrive and updates the DB.
   - For any missing from Google (based on repo) or updated since last sync, copies the photo to the given album in Google Photos.

Next steps:

- Recreated photo db. But 1609 could not be matched to google photos because looks like all those had the wrong filename in google photos. So reuploading all those. These will be duplicated in the album. at some point should remove them. There is no ability to delete photos via API, but can remove them from the album. Do not see an easy way to then totally remove them. Two ideas:
  1.  Move them to another album. (Cannot seem to be able to even archive). Then I guess manually delete one by one since there's no batch remove
  2.  Add description and then search by that to delete. But so far in the UI adding description does not make them appear in search like below. It takes quite a few minutes to index

```
test tagged description
https://photos.google.com/search/_cAF1QipPMrH5bK6RhbFNdpXSliUPBFQacrO2TVVk_Jorge%20Gonzalez/photo/AF1QipO-F0VMr2d8y0WqFyr5mUggVV4pFTtTo0DUSJ41
```

- Should back up JSON before doing updates in case things go corrupt again.
- Can we find duplicates? Test what happens when we add same photo to the same album multiple times (in one drive)
- Can we find rotated photos? I guess aspect ratio is not good enough.
- Authentication for Microsoft expires after 1h and requires a code. Look into refreshable tokens. Did some work in this in branch ms-oauth, but it did not work because a better auth did not work w/ my account since it lacks sharepoint. There may be ways around it or maybe the auth i tried wasn't the best. It's a pain.
- Download from MS only files added to album or updated since last sync. (OneDrive has a sync feature as well which perhaps could be worth it.)
- Authentication for Google seems to allow token refreshing, but not sure for how long. However, it will not refresh during a run.
- Convert to esm
- Improve transfer speed by parallel transfers and bulk creation of media items in Google. (Totally overkill for my use case.)
