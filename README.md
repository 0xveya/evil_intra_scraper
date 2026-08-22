![A green cat saying be evil](static/evilasscat.webp)

# evil intra scraper

Inspect 42 project evaluations without spending the API rate limit every time the page opens. The app uses 42 OAuth, streams evaluation results into a virtual list, and caches completed API responses in Valkey.

> [!CAUTION]
> This is a slop vibe-coded jank-ass tool I prompted into existence while drunk during an all-nighter. Cut me some slack when it is shit, fully buggy, or starts behaving like the code is as sleep-deprived as I was 😭

## Self-host

1. Point a domain at the server.
2. Create a 42 OAuth application with the `public` and `projects` scopes.
3. Set its callback URL to `https://evil_intra_scraper.saygex.xyz/auth/callback`.
4. Copy `.env.example` to `.env` and fill in the OAuth values.
5. Run `docker compose up -d --build`.

The browser receives only an HTTP-only session ID. OAuth tokens and cached 42 responses remain in Valkey. Normal project fetches use the cache; the secondary Refresh button explicitly bypasses it.

## Develop

```sh
docker compose -f compose.dev.yaml up -d
bun install
bun run dev
```

The local OAuth callback is `http://localhost:5173/auth/callback`.

## Refresh generated data

Refresh the project catalogue using the application credentials from `.env`:

```sh
bun run refresh-projects
```

Refresh Vienna Common Core users:

```sh
bun run refresh-campus-users -- 53
```

The user refresh queries cursus 21 directly and includes blackholed and inactive Common Core users. Piscine-only users are not included.

## Deploy

GitHub Actions validates the project and publishes `ghcr.io/0xveya/evil_intra_scraper:latest` from `master`. The VPS deployment uses `compose.vps.yaml` and expects an uncommitted `.env` in `/opt/evil-intra-scraper`.

```sh
./deploy-vps.sh
```
