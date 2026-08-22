import * as v from 'valibot';

import type { IntraRequest } from '$lib/server/intra/request';

const rawListSchema = v.array(v.unknown());

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
				schema: rawListSchema
			});
		},

		scaleTeams(projectSessionId: number, page = 1) {
			return request({
				path: `/project_sessions/${projectSessionId}/scale_teams`,
				query: { 'filter[filled]': true, 'page[number]': page, 'page[size]': 100 },
				schema: rawListSchema
			});
		},

		feedbacks(scaleTeamId: number) {
			return request({
				path: `/scale_teams/${scaleTeamId}/feedbacks`,
				schema: rawListSchema
			});
		},

		scale(scaleId: number) {
			return request({ path: `/scales/${scaleId}`, schema: v.unknown() });
		},

		team(teamId: number) {
			return request({ path: `/teams/${teamId}`, schema: v.unknown() });
		}
	};
}
