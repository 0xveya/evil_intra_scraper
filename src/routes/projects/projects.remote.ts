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

export const fetchScaleTeams = query(projectSessionIdSchema, async (projectSessionId) => {
	const { locals } = getRequestEvent();

	if (!locals.session) {
		error(401, 'Sign in first');
	}

	const cacheKey = `intra:project-session:${projectSessionId}:scale-teams:v1`;
	const valkey = await getValkey();

	const cached = await valkey.get(cacheKey);

	if (cached) {
		try {
			const parsed = v.safeParse(v.array(scaleTeamSchema), JSON.parse(cached));

			if (parsed.success) {
				return parsed.output;
			}
		} catch {
			// invalid cache falls through to the 42 api
		}

		await valkey.del(cacheKey);
	}

	const accessToken = await getApplicationAccessToken();

	const result = await createIntraClient(accessToken).evaluations.scaleTeams(projectSessionId, 1);

	if (result.isErr()) {
		const cause = result.error;

		if (cause.type === 'http') {
			error(cause.status === 403 ? 403 : 502, `42 returned ${cause.status}`);
		}

		if (cause.type === 'network') {
			error(502, 'Could not contact 42');
		}

		error(502, '42 returned invalid scale-team data');
	}

	await valkey.set(cacheKey, JSON.stringify(result.value));

	return result.value;
});
