import { config } from '$lib/server/env';
import { getValkey } from '$lib/server/valkey';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const state = crypto.randomUUID();
	const valkey = await getValkey();
	await valkey.set(`oauth-state:${state}`, '1', { EX: 600 });

	const url = new URL('https://api.intra.42.fr/oauth/authorize');
	url.search = new URLSearchParams({
		client_id: config.clientId(),
		redirect_uri: config.redirectUri(),
		response_type: 'code',
		scope: 'public projects',
		state
	}).toString();
	redirect(303, url.toString());
};
