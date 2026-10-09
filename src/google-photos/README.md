# Google Photos

[GooglePhotosAuthorizer](./GooglePhotosAuthorizer.ts) handles OAuth. Tokens live in `~/Downloads/google-auth-tokens.json` (machine-local, not in git). On each run the saved refresh token is used to get a new access token.

## Re-authorizing (new machine, `invalid_grant`, changed scopes)

`Error: invalid_grant` on startup = Google rejected the saved **refresh token**. Nothing is wrong with the code; get a new token:

1. Check the one-time Google Cloud setup below (esp. publishing status).
2. `npm run auth` — starts the app on `http://localhost:3000` without syncing and prints a Google consent URL.
3. Open the URL, sign in with the Google account that owns the photos, approve all scopes. Google redirects to `/google-photos/oauth2-callback`, which writes the token file ("Token saved").
4. Ctrl-C, then `npm start`.

If `getToken` fails with `redirect_uri_mismatch`, the redirect URI in Cloud Console doesn't match exactly (below). If no `refresh_token` is saved, revoke the app at https://myaccount.google.com/permissions and redo step 2 (the URL already forces `prompt=consent`).

## Google Cloud Console setup (one time per OAuth client)

The client ID/secret in `src/config/config.json` (`googlePhotos`) belong to a Google Cloud project. Console: https://console.cloud.google.com/ (pick the project that owns the client ID's numeric prefix, `156494934327-…`).

1. **APIs & Services → Library**: "Photos Library API" must be enabled.
2. **APIs & Services → Credentials → OAuth 2.0 Client ID** (type _Web application_): _Authorized redirect URIs_ must contain exactly `http://localhost:3000/google-photos/oauth2-callback`.
3. **APIs & Services → OAuth consent screen (Google Auth Platform → Audience)**:
   - **Publishing status = Testing ⇒ refresh tokens expire after 7 days.** This is the usual cause of recurring `invalid_grant`. Fix: _Publish app_ → "In production". For personal use you don't need verification; you just click through the "Google hasn't verified this app" warning (Advanced → Go to app).
   - If you stay in Testing, your Google account must be listed under _Test users_.
   - Data Access/Scopes must include the three scopes in `REQUIRED_SCOPES`.
4. If the client was deleted or the secret rotated, create a new client and update `config.json`. **But see the album caveat below.**

## Scope caveat (since 2025-03-31)

Google removed the broad Photos Library scopes. The app now only gets `photoslibrary.appendonly`, `…readonly.appcreateddata`, `…edit.appcreateddata`: it can only read/modify albums and media **created by this same OAuth client ID**. The target `AlbumId` in [GooglePhotosApi.ts](./GooglePhotosApi.ts) was created by this app; if you switch to a different client ID, the album becomes invisible (404/403) and a new album must be created via the API and its ID substituted.
