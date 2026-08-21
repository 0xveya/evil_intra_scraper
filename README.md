# evil intra scraper

Small SvelteKit probe for exploring project data from the 42 Intra API. It currently authenticates with OAuth, lists the authenticated user's projects, and displays the raw response from `GET /v2/projects/:id`.

## Setup

1. Create a 42 OAuth application at <https://profile.intra.42.fr/oauth/applications/new> with `http://localhost:5173/auth/callback` as its redirect URI.
   Enable the `public` and `projects` scopes. Campus project-session requests require `projects`.
2. Copy `.env.example` to `.env` and fill in the credentials.
3. Start Valkey with `docker compose -f compose.dev.yaml up -d`.
4. Run `bun install`, then `bun run dev`.

The access token is stored in Valkey and the browser receives only an HTTP-only session ID cookie. Deployment is intentionally not configured yet.

## Refresh the project catalogue

The project selector is generated from the Vienna Common Core project sessions ahead of time, so users cannot spend the API rate limit or select inaccessible global projects. With the OAuth application credentials in `.env`, run:

```sh
bun run refresh-projects
```

Set `CAMPUS_ID` or `CURSUS_ID` to generate it for a different campus or cursus.

This replaces `src/lib/server/generated/projects.json`. Review and commit that generated change when useful.

To replace the active Common Core user catalogue for a campus, excluding users whose blackhole deadline has passed, pass its numeric ID:

```sh
bun run refresh-campus-users -- 53
```

The generated users are available through the ID and login maps exported by `src/lib/server/campus-user-cache.ts`. Campus `53` is Vienna.
