import type {
	EvaluatedUserSummary,
	EvaluationFeedbackSummary,
	ProjectEvaluationDump,
	ProjectEvaluationSummary
} from './types';

export function createProjectEvaluationSummary(
	dump: ProjectEvaluationDump
): ProjectEvaluationSummary {
	const users = new Map<number, EvaluatedUserSummary>();

	for (const scaleTeams of Object.values(dump.scaleTeamsByProjectSessionId)) {
		for (const scaleTeam of scaleTeams) {
			const team = scaleTeam.team;
			const correcteds = Array.isArray(scaleTeam.correcteds) ? scaleTeam.correcteds : [];

			for (const corrected of correcteds) {
				let userSummary = users.get(corrected.id);

				if (!userSummary) {
					userSummary = {
						id: corrected.id,
						login: corrected.login,
						teams: []
					};

					users.set(corrected.id, userSummary);
				}

				let teamSummary = userSummary.teams.find((item) => item.id === team?.id);

				if (!teamSummary) {
					const teamUser = team?.users.find((user) => user.id === corrected.id);

					teamSummary = {
						id: team?.id ?? scaleTeam.id,

						finalMark: team?.final_mark ?? null,
						status: team?.status ?? null,
						validated: teamUser?.validated ?? null,

						repoUrl: team?.repo_url ?? null,
						repoUuid: team?.repo_uuid ?? null,

						evaluations: []
					};

					userSummary.teams.push(teamSummary);
				}

				const feedbacks =
					dump.feedbacksByScaleTeamId[String(scaleTeam.id)] ?? scaleTeam.feedbacks ?? [];

				teamSummary.evaluations.push({
					id: scaleTeam.id,

					finalMark: scaleTeam.final_mark ?? null,
					comment: scaleTeam.comment ?? null,
					filledAt: scaleTeam.filled_at ?? null,

					evaluator: scaleTeam.corrector
						? {
								id: scaleTeam.corrector.id,
								login: scaleTeam.corrector.login
							}
						: null,

					flag: scaleTeam.flag
						? {
								id: scaleTeam.flag.id,
								name: scaleTeam.flag.name,
								positive: scaleTeam.flag.positive
							}
						: null,

					feedbacks: feedbacks.map(toFeedbackSummary)
				});
			}
		}
	}

	const result = [...users.values()];

	for (const user of result) {
		for (const team of user.teams) {
			team.evaluations.sort((a, b) => dateValue(b.filledAt) - dateValue(a.filledAt));
		}

		user.teams.sort((a, b) => {
			const aLatest = dateValue(a.evaluations[0]?.filledAt ?? null);
			const bLatest = dateValue(b.evaluations[0]?.filledAt ?? null);

			return bLatest - aLatest;
		});
	}

	result.sort((a, b) => a.login.localeCompare(b.login));

	return {
		projectId: dump.projectId,
		projectSessionId: dump.projectSessions[0]?.id ?? 0,
		users: result
	};
}

function toFeedbackSummary(value: unknown): EvaluationFeedbackSummary {
	if (!value || typeof value !== 'object') {
		return {
			id: null,
			login: null,
			comment: null,
			rating: null,
			createdAt: null
		};
	}

	const feedback = value as Record<string, unknown>;

	const user =
		feedback.user && typeof feedback.user === 'object'
			? (feedback.user as Record<string, unknown>)
			: null;

	return {
		id: typeof feedback.id === 'number' ? feedback.id : null,

		login: typeof user?.login === 'string' ? user.login : null,

		comment: typeof feedback.comment === 'string' ? feedback.comment : null,

		rating: typeof feedback.rating === 'number' ? feedback.rating : null,

		createdAt: typeof feedback.created_at === 'string' ? feedback.created_at : null
	};
}

function dateValue(value: string | null): number {
	if (!value) return 0;

	const time = Date.parse(value);

	return Number.isNaN(time) ? 0 : time;
}
