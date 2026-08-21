const API_BASE = 'https://api.intra.42.fr';
const OUTPUT_PATH = new URL('../src/lib/server/generated/projects.json', import.meta.url);

type Project = { id: number; name: string; slug: string };

async function main(): Promise<number> {
	try {
		const campusId = positiveInteger(process.env.CAMPUS_ID ?? '53', 'CAMPUS_ID');
		const cursusId = positiveInteger(process.env.CURSUS_ID ?? '21', 'CURSUS_ID');
		const token = await getApplicationToken();
		const projects = await fetchProjects(token, campusId, cursusId);
		await Bun.write(OUTPUT_PATH, `${JSON.stringify(projects, null, '\t')}\n`);
		console.log(
			`Wrote ${projects.length} projects for campus ${campusId}, cursus ${cursusId} to ${OUTPUT_PATH.pathname}`
		);
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

async function fetchProjects(
	token: string,
	campusId: number,
	cursusId: number
): Promise<Project[]> {
	const projects = new Map<number, Project>();
	const first = new URL(`${API_BASE}/v2/project_sessions`);
	first.search = new URLSearchParams({
		'filter[campus_id]': String(campusId),
		'filter[cursus_id]': String(cursusId),
		page: '1',
		per_page: '100',
		sort: 'project_id'
	}).toString();
	let url: string | null = first.toString();
	while (url) {
		const response = await fetch(url, {
			headers: { accept: 'application/json', authorization: `Bearer ${token}` }
		});
		const body = await readJson(response);
		if (!response.ok || !Array.isArray(body)) {
			throw new Error(`Could not fetch projects: ${response.status} ${JSON.stringify(body)}`);
		}
		for (const session of body) {
			if (!isRecord(session) || !isRecord(session.project)) continue;
			const { id, name, slug } = session.project;
			if (typeof id === 'number' && typeof name === 'string' && typeof slug === 'string') {
				projects.set(id, { id, name, slug });
			}
		}
		url = nextPage(response.headers.get('link'));
	}
	return [...projects.values()].toSorted((left, right) => left.name.localeCompare(right.name));
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

function positiveInteger(value: string, name: string): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0)
		throw new Error(`${name} must be a positive integer`);
	return parsed;
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
