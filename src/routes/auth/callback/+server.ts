import { getMe, exchangeCode } from '$lib/server/intra';
import { getValkey } from '$lib/server/valkey';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !state) error(400, 'Missing OAuth code or state');

	const valkey = await getValkey();
	if (!(await valkey.getDel(`oauth-state:${state}`))) {
		error(400, 'OAuth state is invalid or expired');
	}

	try {
		const token = await exchangeCode(code);
		const me = await getMe(token.accessToken);
		const sessionId = crypto.randomUUID();
		await valkey.set(
			`session:${sessionId}`,
			JSON.stringify({
				...me,
				accessToken: token.accessToken,
				expiresAt: Date.now() + token.expiresIn * 1000
			}),
			{ EX: token.expiresIn }
		);
		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !import.meta.env.DEV,
			maxAge: token.expiresIn
		});
	} catch (cause) {
		console.error('42 OAuth callback failed', cause);
		error(502, '42 rejected the authentication request');
	}
	redirect(303, '/projects');
};
