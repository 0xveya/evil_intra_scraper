import { getMe, exchangeCode } from '$lib/server/intra';
import { seal, unseal } from '$lib/server/session';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const saved = await unseal<{ state: string }>(cookies.get('oauth_state') ?? '');
	cookies.delete('oauth_state', { path: '/' });
	if (!code || !state || !saved || saved.state !== state)
		error(400, 'OAuth state is invalid or expired');
	try {
		const token = await exchangeCode(code);
		const me = await getMe(token.accessToken);
		cookies.set(
			'session',
			await seal({
				...me,
				accessToken: token.accessToken,
				expiresAt: Date.now() + token.expiresIn * 1000
			}),
			{
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: !import.meta.env.DEV,
				maxAge: token.expiresIn
			}
		);
	} catch (cause) {
		console.error('42 OAuth callback failed', cause);
		error(502, '42 rejected the authentication request');
	}
	redirect(303, '/projects');
};
