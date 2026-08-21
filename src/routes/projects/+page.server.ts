import { fail, redirect } from '@sveltejs/kit';
import { getProject, getProjects } from '$lib/server/intra';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) redirect(303, '/');
	try {
		return { user: locals.session.login, projects: await getProjects(locals.session.accessToken) };
	} catch (cause) {
		console.error('Could not load 42 projects', cause);
		return {
			user: locals.session.login,
			projects: [],
			loadError: 'Could not load your projects from 42.'
		};
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) redirect(303, '/');
		const id = Number((await request.formData()).get('projectId'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { message: 'Choose a valid project.' });
		try {
			return { selectedId: id, response: await getProject(locals.session.accessToken, id) };
		} catch (cause) {
			console.error('Could not load 42 project', cause);
			return fail(502, { selectedId: id, message: '42 could not return that project.' });
		}
	}
};
