# evil intra scraper

Small SvelteKit probe for exploring project data from the 42 Intra API. It currently authenticates with OAuth, lists the authenticated user's projects, and displays the raw response from `GET /v2/projects/:id`.

## Setup

1. Create a 42 OAuth application at <https://profile.intra.42.fr/oauth/applications/new> with `http://localhost:5173/auth/callback` as its redirect URI.
2. Copy `.env.example` to `.env` and fill in the credentials. Generate `SESSION_SECRET` with `openssl rand -base64 32`.
3. Run `bun install`, then `bun run dev`.

The access token is stored only in an encrypted, HTTP-only cookie. Deployment is intentionally not configured yet.
