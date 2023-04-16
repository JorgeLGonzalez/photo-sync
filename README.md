# Photo Sync

TODO

- Tried improving ms authentication. Was able to ge tokens and refresh token.
  But with my registered app get error that tenant lacks SPO license. So screwed.
  Go back to prior method. Can try using common tenant but then need the client secret. Or back to square one on how to use the auth code flow. So annoying!
  See https://learn.microsoft.com/en-us/answers/questions/1075881/error-tenant-does-not-have-a-spo-license-for-perso

Synchronize photos between the main Album in OneDrive and Google Photos.
Very rudimentary at the moment.

1. Authenticate with both Microsoft and Google via OAuth2 delegation. `OneDriveApi.onModuleInit` initiates authentication for Microsoft while `GooglePhotosAp.OnModuleInit` does it for Google.
2. `PhotoRepo.onModuleInit` awaits authorization and then:
   - Loads existing `IPhotoRepo` from local JSON (or creates new one)
   - Downloads all photo records (metadata) from the specified album in OneDrive and updates the DB.
   - For any missing from Google (based on repo) or updated since last sync, copies the photo to the given album in Google Photos.

Next steps:

- Authentication for Microsoft expires after 1h and requires a code. Look into refreshable tokens.
- Download photo metadata from Google to ensure local repo is accurate.
- Download from MS only files added to album or updated since last sync. (OneDrive has a sync feature as well which perhaps could be worth it.)
- Authentication for Google seems to allow token refreshing, but not sure for how long. However, it will not refresh during a run.
- Convert to esm
- Run as CLI or shutdown server once done. (It is only a server because Google auth uses a callback for initial tokens.) Could of course turn into a web or other better UI-based app, but that seems hardly worth it...
- Improve transfer speed by parallel transfers and bulk creation of media items in Google. (Totally overkill for my use case.)
