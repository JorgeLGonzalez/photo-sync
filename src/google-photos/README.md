# Google Photos

[GooglePhotosAuthorizer](./GooglePhotosAuthorizer.ts) handles the authorization. The access token can typically be refreshed from the one saved in the `TokenFilePath`. But if that file needs to be recreated, its a bit of a pain and can be accomplished with steps like this:

1. Rename the old file if needed.
2. Uncomment `app.listen` in [main](../main.ts).
3. Run the app and click on the URL returned by [GooglePhotosAuthorizer](./GooglePhotosAuthorizer.ts)`.showAuthUrl `.
