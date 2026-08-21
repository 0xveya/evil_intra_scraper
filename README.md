# evil intra scraper

Small SvelteKit probe for exploring project data from the 42 Intra API. It currently authenticates with OAuth, lists the authenticated user's projects, and displays the raw response from `GET /v2/projects/:id`.

## Setup

1. Create a 42 OAuth application at <https://profile.intra.42.fr/oauth/applications/new> with `http://localhost:5173/auth/callback` as its redirect URI.
2. Copy `.env.example` to `.env` and fill in the credentials.
3. Start Valkey with `docker compose -f compose.dev.yaml up -d`.
4. Run `bun install`, then `bun run dev`.

The access token is stored in Valkey and the browser receives only an HTTP-only session ID cookie. Deployment is intentionally not configured yet.

## Refresh the project catalogue

The project selector is generated ahead of time so users cannot spend the API rate limit by refreshing it. With the OAuth application credentials in `.env`, run:

```sh
bun run refresh-projects
```

This replaces `src/lib/server/generated/projects.json`. Review and commit that generated change when useful.
