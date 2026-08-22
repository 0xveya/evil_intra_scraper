export type ProjectEvaluationDump = {
	version: 1;
	fetchedAt: string;
	campusId: number;
	cursusId: number;
	projectId: number;

	projectSessions: unknown[];
	scaleTeamsByProjectSessionId: Record<string, unknown[]>;
	feedbacksByScaleTeamId: Record<string, unknown[]>;
	scalesById: Record<string, unknown>;
	teamsById: Record<string, unknown>;

	errors: RefreshError[];
};

export type RefreshError = {
	endpoint: string;
	status: number;
	body: unknown;
};

export type RefreshStatus = {
	state: 'idle' | 'running' | 'failed';
	startedAt: string | null;
	finishedAt: string | null;
	lastSuccessfulAt: string | null;
	error: string | null;
};

export type ProjectEvaluationIndex = {
	evaluations: Evaluation[];
	evaluationsById: Record<string, Evaluation>;
	evaluationIdsByUserId: Record<string, number[]>;
	evaluationIdsByTeamId: Record<string, number[]>;
};

export type Evaluation = {
	id: number;
	projectId: number;
	projectSessionId: number;
	teamId: number | null;
	scaleId: number | null;
	finalMark: number | null;
	comment: string | null;
	filledAt: string | null;
	evaluator: { id: number; login: string } | null;
	evaluatedUsers: Array<{ id: number; login: string }>;
	feedbacks: unknown[];
};
