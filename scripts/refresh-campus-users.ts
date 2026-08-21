const API_BASE = 'https://api.intra.42.fr';
const COMMON_CORE_CURSUS_ID = 21;
const OUTPUT_PATH = new URL('../src/lib/server/generated/campus-users.json', import.meta.url);

type CampusUser = { id: number; login: string; displayName: string };

async function main(): Promise<number> {
	try {
		const campusId = parseCampusId(Bun.argv[2] ?? process.env.CAMPUS_ID);
		const token = await getApplicationToken();
		const users = await fetchCampusUsers(token, campusId);
		await Bun.write(
			OUTPUT_PATH,
			`${JSON.stringify({ campusId, cursusId: COMMON_CORE_CURSUS_ID, users }, null, '\t')}\n`
		);
		console.log(`Wrote ${users.length} active Common Core users for campus ${campusId}.`);
		return 0;
	} catch (cause) {
		console.error(cause instanceof Error ? cause.message : cause);
		return 1;
	}
}

async function getApplicationToken(): Promise<string> {
	const response = await fetch(`${API_BASE}/oauth/token`, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: requiredEnv('FORTYTWO_CLIENT_ID'),
			client_secret: requiredEnv('FORTYTWO_CLIENT_SECRET')
		})
	});
	const body = await readJson(response);
	if (!response.ok || !isRecord(body) || typeof body.access_token !== 'string') {
		throw new Error(
			`Could not get a 42 application token: ${response.status} ${JSON.stringify(body)}`
		);
	}
	return body.access_token;
}

async function fetchCampusUsers(token: string, campusId: number): Promise<CampusUser[]> {
	const users: CampusUser[] = [];
	const first = new URL(`${API_BASE}/v2/cursus/${COMMON_CORE_CURSUS_ID}/cursus_users`);
	first.search = new URLSearchParams({
		'filter[campus_id]': String(campusId),
		'filter[active]': 'true',
		page: '1',
		per_page: '100',
		sort: 'user_id'
	}).toString();
	let url: string | null = first.toString();

	while (url) {
		const response = await fetch(url, {
			headers: { accept: 'application/json', authorization: `Bearer ${token}` }
		});
		const body = await readJson(response);
		if (!response.ok || !Array.isArray(body)) {
			throw new Error(`Could not fetch campus users: ${response.status} ${JSON.stringify(body)}`);
		}
		for (const cursusUser of body) {
			if (!isRecord(cursusUser) || !isRecord(cursusUser.user)) continue;
			if (!hasNotReachedBlackhole(cursusUser.blackholed_at)) continue;
			const { id, login, displayname } = cursusUser.user;
			if (typeof id === 'number' && typeof login === 'string' && typeof displayname === 'string') {
				users.push({ id, login, displayName: displayname });
			}
		}
		url = nextPage(response.headers.get('link'));
	}
	return users;
}

function hasNotReachedBlackhole(value: unknown): boolean {
	return value === null || (typeof value === 'string' && Date.parse(value) > Date.now());
}

function parseCampusId(value: string | undefined): number {
	const campusId = Number(value);
	if (!Number.isInteger(campusId) || campusId <= 0) {
		throw new Error('Pass a campus ID: bun run refresh-campus-users -- <campus-id>');
	}
	return campusId;
}

function nextPage(link: string | null): string | null {
	return (
		link
			?.split(',')
			.find((part) => part.includes('rel="next"'))
			?.match(/<([^>]+)>/)?.[1] ?? null
	);
}

function requiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
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

process.exitCode = await main();
