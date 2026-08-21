const API_BASE = 'https://api.intra.42.fr';
const OUTPUT_PATH = new URL('../src/lib/server/generated/projects.json', import.meta.url);

type Project = { id: number; name: string; slug: string };

async function main(): Promise<number> {
	try {
		const token = await getApplicationToken();
		const projects = await fetchProjects(token);
		await Bun.write(OUTPUT_PATH, `${JSON.stringify(projects, null, '\t')}\n`);
		console.log(`Wrote ${projects.length} projects to ${OUTPUT_PATH.pathname}`);
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

async function fetchProjects(token: string): Promise<Project[]> {
	const projects: Project[] = [];
	let url: string | null = `${API_BASE}/v2/projects?page=1&per_page=100&sort=name`;
	while (url) {
		const response = await fetch(url, {
			headers: { accept: 'application/json', authorization: `Bearer ${token}` }
		});
		const body = await readJson(response);
		if (!response.ok || !Array.isArray(body)) {
			throw new Error(`Could not fetch projects: ${response.status} ${JSON.stringify(body)}`);
		}
		for (const value of body) {
			if (!isRecord(value)) continue;
			const { id, name, slug } = value;
			if (typeof id === 'number' && typeof name === 'string' && typeof slug === 'string') {
				projects.push({ id, name, slug });
			}
		}
		url = nextPage(response.headers.get('link'));
	}
	return projects;
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
