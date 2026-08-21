import { config } from './env';

export type Session = {
	userId: number;
	login: string;
	accessToken: string;
	expiresAt: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function seal(value: unknown): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		await sessionKey(),
		encoder.encode(JSON.stringify(value))
	);
	return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function unseal<T>(value: string): Promise<T | null> {
	try {
		const [encodedIv, encodedCiphertext] = value.split('.');
		if (!encodedIv || !encodedCiphertext) return null;
		const plaintext = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: fromBase64Url(encodedIv) },
			await sessionKey(),
			fromBase64Url(encodedCiphertext)
		);
		return JSON.parse(decoder.decode(plaintext)) as T;
	} catch {
		return null;
	}
}

async function sessionKey(): Promise<CryptoKey> {
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(config.sessionSecret()));
	return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function toBase64Url(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	return new Uint8Array(Buffer.from(value, 'base64url'));
}
