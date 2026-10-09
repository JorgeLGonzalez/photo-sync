# photo-sync — notes for AI assistants

Personal one-way sync: photos in a OneDrive album → an app-created Google Photos album. NestJS 9 / TypeScript, Node 18 (`.nvmrc`). Not a server: `src/main.ts` boots Nest, runs `PhotoRepo.sync()`, exits.

## Commands

- `npm start` — run a sync. Needs env `CONFIG_FILE` (path to config JSON; usually `src/config/config.json`, set in the user's shell profile — if missing, `createAppConfig` throws).
- `npm run auth` — re-authorize Google (serves OAuth callback on :3000, no sync). See [src/google-photos/README.md](src/google-photos/README.md).
- `npm run build`, `npm run lint`, `npm test` (essentially no tests exist). `npx tsc --noEmit` has one known pre-existing error in `test/app.e2e-spec.ts`.

## Layout

- `src/photo-repo/` — `PhotoRepo` (local DB at `~/Documents/photo-db.json`, drives sync), `Reconciler` (matches repo records to Google items).
- `src/one-drive/` — `OneDriveApi` (Graph API, **device-code login each run**, token at `~/Downloads/ms-auth-tokens.json`; prints a code to enter in a browser, expires ~1h), `AlbumCopier` (one-off).
- `src/google-photos/` — `GooglePhotosAuthorizer` (OAuth2, refresh), `GooglePhotosApi` (upload bytes + create media item into hard-coded `AlbumId`), controller for the OAuth callback.
- `src/config/` — config types; `config.json` is gitignored and holds secrets.

## State outside the repo (machine-local — this is what breaks on a new Mac)

| File | Purpose |
| --- | --- |
| `src/config/config.json` | Google client id/secret, OneDrive client/tenant ids (gitignored) |
| `~/Downloads/google-auth-tokens.json` | Google access+refresh token |
| `~/Downloads/ms-auth-tokens.json` | Microsoft token |
| `~/Documents/photo-db.json` | Sync DB. **Losing it causes duplicate uploads**; back up before big changes |

## Gotchas

- Google `invalid_grant` on startup = dead refresh token (7-day expiry if the Cloud consent screen is in "Testing", revoked, or never migrated). Fix is `npm run auth`, not code changes. Details/Console steps in the google-photos README.
- Google Photos API only exposes app-created data (since 2025-03-31); the album/client ID pairing matters.
- `config.json` contains real secrets (also a stale `oneDriveBAK-not-working` block). Never print, commit or paste them; redact when showing the file.
- Imports use `src/...` absolute paths (tsconfig baseUrl) as well as relative ones.
- Never run a real sync as a "test" without the user's say-so: it uploads photos to their Google account.
