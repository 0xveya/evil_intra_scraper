import { config } from '$lib/server/env';
import { seal } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = crypto.randomUUID();
	cookies.set('oauth_state', await seal({ state }), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.env.DEV,
		maxAge: 600
	});
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
