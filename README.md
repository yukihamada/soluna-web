# SOLUNA — Music Distribution Platform

Artist-first music platform. Drop a track, get a radio channel.

**Live:** https://soluna-web.fly.dev

## Features

- **Instant publish** — Upload MP3/WAV/FLAC, live in 5 seconds
- **AI cover art** — Gemini generates artwork from genre + mood
- **Auto rights protection** — ISRC issuance + SHA-256 hash proof per track
- **Personal radio channel** — Auto-created on first upload, shareable URL
- **Royalty tracking (beta)** — 30-second play standard, per-play logging
- **Metadata enrichment** — iTunes, MusicBrainz, AcoustID, lyrics.ovh auto-fetch
- **Duplicate detection** — SHA-256 + Chromaprint fingerprinting

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (static export) |
| Server | Express.js (Node 22) |
| Database | SQLite (libSQL) on Fly.io Volume |
| File Storage | Tigris S3 (audio + covers) |
| AI | Gemini 3.1 Flash (cover art generation) |
| Deploy | Fly.io (nrt), 2 machines, rolling deploy |
| Audio | Chromaprint/fpcalc for fingerprinting |

## Architecture

```
Browser ──► Express (server.js)
              ├── /api/v1/tracks     → Upload → S3 (Tigris)
              ├── /api/v1/tracks/:id/stream → S3 → Range requests
              ├── /api/v1/radios     → Radio channel CRUD
              ├── /radio/:slug       → Server-rendered radio player
              ├── /artists/:slug     → Server-rendered artist profile
              ├── /covers/:file      → S3 → local fallback
              └── out/               → Next.js static pages
```

## Local Development

```bash
npm install
npm run dev          # Next.js dev server (frontend)
node server.js       # Express server (API + static)
```

## Deploy

```bash
npm run build                          # Next.js static export → out/
fly deploy --remote-only -a soluna-web  # Docker build + deploy
```

## Environment Variables (Fly.io Secrets)

| Key | Purpose |
|-----|---------|
| `ADMIN_KEY` | Admin API endpoints |
| `GEMINI_API_KEY` | AI cover art generation |
| `BUCKET_NAME` | Tigris S3 bucket |
| `AWS_ACCESS_KEY_ID` | Tigris credentials |
| `AWS_SECRET_ACCESS_KEY` | Tigris credentials |
| `AWS_ENDPOINT_URL_S3` | Tigris endpoint |
| `STRIPE_SECRET_KEY` | Payment (future) |
| `SOLANA_ANCHOR_KEY` | Blockchain anchoring (optional) |

## Admin Endpoints

```bash
# Bulk AI cover generation
curl -X POST /api/v1/admin/generate-covers -H "x-admin-key: $KEY"

# Migrate local files to S3
curl -X POST /api/v1/admin/migrate-s3 -H "x-admin-key: $KEY"

# Backfill metadata enrichment
curl -X POST /api/v1/admin/backfill-metadata -H "x-admin-key: $KEY"
```

## Project Structure

```
server.js             # Express server (API + SSR radio/artist pages)
server-package.json   # Server-only dependencies (used in Docker)
app/                  # Next.js pages (static export)
  artist/page.tsx     # Artist portal (landing + dashboard)
public/images/        # Gemini-generated landing page images
Dockerfile            # Node 22 + chromaprint
fly.toml              # Fly.io config
```
