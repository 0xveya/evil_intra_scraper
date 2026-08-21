import { fail, redirect } from '@sveltejs/kit';
import { getProject, IntraError } from '$lib/server/intra';
import { getCachedProject, getCachedProjects } from '$lib/server/project-cache';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.session) redirect(303, '/');
	return { user: locals.session.login, projects: getCachedProjects() };
};

export const actions: Actions = {
	project: async ({ request, locals }) => {
		if (!locals.session) redirect(303, '/');
		const id = Number((await request.formData()).get('projectId'));
		const cached = getCachedProject(id);
		if (!Number.isInteger(id) || !cached) {
			return fail(400, { message: 'Choose a project from the loaded list.' });
		}
		try {
			return {
				selectedId: id,
				response: await getProject(locals.session.accessToken, id)
			};
		} catch (cause) {
			console.error('Could not load 42 project', cause);
			return fail(502, {
				selectedId: id,
				message: intraErrorMessage(`load ${cached.name}`, cause)
			});
		}
	}
};

function intraErrorMessage(action: string, cause: unknown): string {
	if (!(cause instanceof IntraError)) return `Could not ${action}.`;
	const detail =
		typeof cause.body === 'object' &&
		cause.body !== null &&
		'message' in cause.body &&
		typeof cause.body.message === 'string'
			? ` ${cause.body.message}`
			: '';
	return `Could not ${action}: 42 returned ${cause.status}.${detail}`;
}
