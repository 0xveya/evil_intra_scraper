import { getRequestEvent, query } from '$app/server';
import { getValkey } from '$lib/server/valkey';
import { projectSessionSchema, scaleTeamSchema } from '$lib/server/evals/schemas';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';

import { campusUserCache } from '$lib/server/campus-user-cache';
import { getApplicationAccessToken } from '$lib/server/intra';
import { createIntraClient } from '$lib/server/intra/client';
import { getCachedProject } from '$lib/server/project-cache';

const projectIdSchema = v.pipe(v.number(), v.integer(), v.minValue(1));

const projectSessionIdSchema = v.pipe(v.number(), v.integer(), v.minValue(1));
const SCALE_TEAMS_PAGE_SIZE = 100;
const MAX_SCALE_TEAM_PAGES = 100;

function wait(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

type ScaleTeam = v.InferOutput<typeof scaleTeamSchema>;

type ScaleTeamStreamUpdate = {
	items: ScaleTeam[];
	page: number;
	complete: boolean;
	source: '42' | 'cache';
};

export const streamScaleTeams = query.live(
	projectSessionIdSchema,
	async function* (projectSessionId) {
		const { locals } = getRequestEvent();

		if (!locals.session) {
			error(401, 'Sign in first');
		}

		const cacheKey = `intra:project-session:${projectSessionId}:scale-teams:all:v1`;

		const valkey = await getValkey();
		const cached = await valkey.get(cacheKey);

		if (cached) {
			try {
				const parsed = v.safeParse(v.array(scaleTeamSchema), JSON.parse(cached));

				if (parsed.success) {
					yield {
						items: parsed.output,
						page: 1,
						complete: true,
						source: 'cache'
					} satisfies ScaleTeamStreamUpdate;

					return;
				}
			} catch {
				// Invalid cache falls through to 42.
			}

			await valkey.del(cacheKey);
		}

		const accessToken = await getApplicationAccessToken();

		const client = createIntraClient(accessToken);

		const collected: ScaleTeam[] = [];

		for (let page = 1; page <= MAX_SCALE_TEAM_PAGES; page += 1) {
			const result = await client.evaluations.scaleTeams(projectSessionId, page);

			if (result.isErr()) {
				const cause = result.error;

				if (cause.type === 'http') {
					error(cause.status === 403 ? 403 : 502, `42 returned ${cause.status} on page ${page}`);
				}

				if (cause.type === 'network') {
					error(502, `Could not contact 42 on page ${page}`);
				}

				error(502, `42 returned invalid data on page ${page}`);
			}

			collected.push(...result.value);

			const complete = result.value.length < SCALE_TEAMS_PAGE_SIZE;

			yield {
				items: [...collected],
				page,
				complete,
				source: '42'
			} satisfies ScaleTeamStreamUpdate;

			if (complete) {
				await valkey.set(cacheKey, JSON.stringify(collected));

				return;
			}

			await wait(550);
		}

		error(502, `Scale-team pagination exceeded ${MAX_SCALE_TEAM_PAGES} pages`);
	}
);

export const fetchProjectSessions = query(projectIdSchema, async (projectId) => {
	const { locals } = getRequestEvent();

	if (!locals.session) {
		error(401, 'Sign in first');
	}

	const project = getCachedProject(projectId);

	if (!project) {
		error(404, 'Unknown project');
	}

	const cacheKey = `intra:project:${projectId}:sessions:v1`;
	const valkey = await getValkey();

	const cached = await valkey.get(cacheKey);

	if (cached) {
		try {
			const parsed = v.safeParse(v.array(projectSessionSchema), JSON.parse(cached));

			if (parsed.success) {
				return parsed.output;
			}
		} catch {
			// invalid cache falls through to the 42 api
		}

		await valkey.del(cacheKey);
	}

	const accessToken = await getApplicationAccessToken();

	const result = await createIntraClient(accessToken).evaluations.projectSessions(
		projectId,
		campusUserCache.campusId,
		campusUserCache.cursusId
	);

	if (result.isErr()) {
		const cause = result.error;

		if (cause.type === 'http') {
			error(cause.status === 403 ? 403 : 502, `42 returned ${cause.status}`);
		}

		if (cause.type === 'network') {
			error(502, 'Could not contact 42');
		}

		error(502, '42 returned invalid project data');
	}

	await valkey.set(cacheKey, JSON.stringify(result.value));

	return result.value;
});
