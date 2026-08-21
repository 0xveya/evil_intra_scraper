declare global {
	namespace App {
		interface Locals {
			session: {
				id: string;
				userId: number;
				login: string;
				accessToken: string;
				expiresAt: number;
			} | null;
		}
	}
}

export {};
