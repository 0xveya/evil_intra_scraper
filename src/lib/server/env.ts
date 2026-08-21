import { env } from '$env/dynamic/private';

function required(name: string): string {
	const value = env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

export const config = {
	clientId: () => required('FORTYTWO_CLIENT_ID'),
	clientSecret: () => required('FORTYTWO_CLIENT_SECRET'),
	redirectUri: () => required('FORTYTWO_REDIRECT_URI'),
	sessionSecret: () => required('SESSION_SECRET')
} as const;
