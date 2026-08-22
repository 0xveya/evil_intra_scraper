import type { ScaleTeam } from '$lib/server/evals/schemas';

export type EvaluationView = {
	id: number;
	mark: number | null;
	failed: boolean;
	flag: string | null;
	comment: string | null;
	evaluator: string | null;
	students: Array<{
		id: number;
		login: string;
		validated: boolean | null;
	}>;
	team: {
		id: number | null;
		name: string | null;
		status: string | null;
		repository: string | null;
	};
	feedbacks: EvaluationFeedbackView[];
};

export type EvaluationFeedbackView = {
	login: string | null;
	comment: string | null;
	rating: number | null;
};

export function toEvaluationView(scaleTeam: ScaleTeam): EvaluationView {
	const correctedUsers = Array.isArray(scaleTeam.correcteds) ? scaleTeam.correcteds : [];

	return {
		id: scaleTeam.id,
		mark: scaleTeam.final_mark ?? null,
		failed: isEvaluationFailure(scaleTeam),
		flag: scaleTeam.flag?.name ?? null,
		comment: scaleTeam.comment ?? null,
		evaluator: scaleTeam.corrector?.login ?? null,
		students: correctedUsers.map((user) => ({
			id: user.id,
			login: user.login,
			validated:
				scaleTeam.team?.users.find((teamUser) => teamUser.id === user.id)?.validated ?? null
		})),
		team: {
			id: scaleTeam.team?.id ?? null,
			name: scaleTeam.team?.name ?? null,
			status: scaleTeam.team?.status ?? null,
			repository: scaleTeam.team?.repo_url ?? null
		},
		feedbacks: (scaleTeam.feedbacks ?? []).map(toFeedbackView)
	};
}

export function isEvaluationFailure(scaleTeam: ScaleTeam): boolean {
	return (
		scaleTeam.flag?.positive === false ||
		scaleTeam.team?.users.some((user) => user.validated === false) === true
	);
}

function toFeedbackView(value: unknown): EvaluationFeedbackView {
	if (!isRecord(value)) return { login: null, comment: null, rating: null };

	const user = isRecord(value.user) ? value.user : null;

	return {
		login: typeof user?.login === 'string' ? user.login : null,
		comment: typeof value.comment === 'string' ? value.comment : null,
		rating: typeof value.rating === 'number' ? value.rating : null
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}
