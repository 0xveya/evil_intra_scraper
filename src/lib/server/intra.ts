const API_BASE = 'https://api.intra.42.fr';
let applicationToken: { value: string; expiresAt: number } | null = null;

export type ProjectChoice = { id: number; name: string; slug: string };

export async function exchangeCode(
	code: string
): Promise<{ accessToken: string; expiresIn: number }> {
	const { config } = await import('./env');
	const response = await fetch(`${API_BASE}/oauth/token`, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: config.clientId(),
			client_secret: config.clientSecret(),
			redirect_uri: config.redirectUri(),
			code
		})
	});
	const body = await readJson(response);
	if (
		!response.ok ||
		!isRecord(body) ||
		typeof body.access_token !== 'string' ||
		typeof body.expires_in !== 'number'
	) {
		throw new IntraError(response.status, body);
	}
	return { accessToken: body.access_token, expiresIn: body.expires_in };
}

export async function getApplicationAccessToken(): Promise<string> {
	if (applicationToken && applicationToken.expiresAt > Date.now() + 60_000) {
		return applicationToken.value;
	}
	const { config } = await import('./env');
	const response = await fetch(`${API_BASE}/oauth/token`, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: config.clientId(),
			client_secret: config.clientSecret()
		})
	});
	const body = await readJson(response);
	if (
		!response.ok ||
		!isRecord(body) ||
		typeof body.access_token !== 'string' ||
		typeof body.expires_in !== 'number'
	) {
		throw new IntraError(response.status, body);
	}
	applicationToken = {
		value: body.access_token,
		expiresAt: Date.now() + body.expires_in * 1000
	};
	return applicationToken.value;
}

export async function getMe(token: string): Promise<{ id: number; login: string }> {
	const body = await request(token, '/v2/me');
	if (!isRecord(body) || typeof body.id !== 'number' || typeof body.login !== 'string') {
		throw new Error('42 returned an unexpected user response');
	}
	return { id: body.id, login: body.login };
}

async function request(token: string, path: string): Promise<unknown> {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: { accept: 'application/json', authorization: `Bearer ${token}` }
	});
	const body = await readJson(response);
	if (!response.ok) throw new IntraError(response.status, body);
	return body;
}

async function readJson(response: Response): Promise<unknown> {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export class IntraError extends Error {
	constructor(
		public readonly status: number,
		public readonly body: unknown
	) {
		super(`42 API request failed with status ${status}`);
	}
}
