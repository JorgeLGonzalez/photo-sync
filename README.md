# Photo Sync

Synchronize photos between the main Album in OneDrive and Google Photos.
Very rudimentary at the moment.

1. Authenticate with both Microsoft and Google via OAuth2 delegation. `OneDriveApi.onModuleInit` initiates authentication for Microsoft while `GooglePhotosAp.OnModuleInit` does it for Google.
2. `PhotoRepo.onModuleInit` awaits authorization and then:
   - Loads existing `IPhotoRepo` from local JSON (or creates new one)
   - Downloads all photo records (metadata) from the specified album in OneDrive and updates the DB.
   - For any missing from Google (based on repo) or updated since last sync, copies the photo to the given album in Google Photos.

Next steps:

- Download photo metadata from Google to ensure local repo is accurate. This is now essential since the photo db got wiped. (So another feature is to back it up before starting to make changes on it). So now we need to get the photos from google and add them back so as to avoid re-uploading all 2300+ of them. Note some of this code exists in photo-sync-old folder
- See if we can hook up to the new album in one drive since the old one no longer shows on their web app. If so, we want to convert to that, which means copying all from the current album to the new one. No idea how hard that is.
- Can we find duplicates? Test what happens when we add same photo to the same album multiple times (in one drive)
- Can we find rotated photos? I guess aspect ratio is not good enough.
- Authentication for Microsoft expires after 1h and requires a code. Look into refreshable tokens. Did some work in this in branch ms-oauth, but it did not work because a better auth did not work w/ my account since it lacks sharepoint. There may be ways around it or maybe the auth i tried wasn't the best. It's a pain.
- Download from MS only files added to album or updated since last sync. (OneDrive has a sync feature as well which perhaps could be worth it.)
- Authentication for Google seems to allow token refreshing, but not sure for how long. However, it will not refresh during a run.
- Convert to esm
- Run as CLI or shutdown server once done. (It is only a server because Google auth uses a callback for initial tokens.) Could of course turn into a web or other better UI-based app, but that seems hardly worth it...
- Improve transfer speed by parallel transfers and bulk creation of media items in Google. (Totally overkill for my use case.)
