import { evaluations } from '$lib/server/evals/api';
import { createIntraRequest } from './request';

export function createIntraClient(accessToken: string) {
	const request = createIntraRequest(accessToken);
	return { evaluations: evaluations(request) };
}
