declare global {
	namespace App {
		interface Locals {
			session: import('$lib/server/session').Session | null;
		}
	}
}

export {};
