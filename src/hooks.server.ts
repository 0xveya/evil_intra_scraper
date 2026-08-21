import { unseal, type Session } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const encoded = event.cookies.get('session');
	event.locals.session = encoded ? await unseal<Session>(encoded) : null;
	if (event.locals.session && event.locals.session.expiresAt <= Date.now()) {
		event.locals.session = null;
		event.cookies.delete('session', { path: '/' });
	}
	return resolve(event);
};
