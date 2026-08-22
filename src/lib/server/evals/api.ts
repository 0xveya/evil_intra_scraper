import * as v from 'valibot';

import type { IntraRequest } from '$lib/server/intra/request';
import {
	projectSessionSchema,
	scaleTeamSchema,
	storedEntitySchema
} from '$lib/server/evals/schemas';

export function evaluations(request: IntraRequest) {
	return {
		projectSessions(projectId: number, campusId: number, cursusId: number) {
			return request({
				path: `/projects/${projectId}/project_sessions`,
				query: {
					'filter[campus_id]': campusId,
					'filter[cursus_id]': cursusId,
					'page[size]': 100
				},
				schema: v.array(projectSessionSchema)
			});
		},

		scaleTeams(projectSessionId: number, page = 1) {
			return request({
				path: `/project_sessions/${projectSessionId}/scale_teams`,
				query: { 'filter[filled]': true, 'page[number]': page, 'page[size]': 100 },
				schema: v.array(scaleTeamSchema)
			});
		},

		feedbacks(scaleTeamId: number) {
			return request({
				path: `/scale_teams/${scaleTeamId}/feedbacks`,
				schema: v.array(v.unknown())
			});
		},

		scale(scaleId: number) {
			return request({ path: `/scales/${scaleId}`, schema: storedEntitySchema });
		},

		team(teamId: number) {
			return request({ path: `/teams/${teamId}`, schema: storedEntitySchema });
		}
	};
}
