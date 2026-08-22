import type { ProjectSession, ScaleTeam, StoredEntity } from './schemas';

export type ProjectEvaluationDump = {
	version: 1;
	fetchedAt: string;
	campusId: number;
	cursusId: number;
	projectId: number;

	projectSessions: ProjectSession[];
	scaleTeamsByProjectSessionId: Record<string, ScaleTeam[]>;
	feedbacksByScaleTeamId: Record<string, unknown[]>;
	scalesById: Record<string, StoredEntity>;
	teamsById: Record<string, StoredEntity>;

	errors: RefreshError[];
};

export type RefreshError = {
	endpoint: string;
	status: number;
	body: unknown;
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

export type EvaluationCacheError =
	| {
			type: 'valkey';
			operation: 'get' | 'set' | 'del' | 'rename';
			key: string;
			cause: unknown;
	  }
	| {
			type: 'invalid-cache';
			key: string;
			cause: unknown;
	  };

export type CachedValue<T> = {
	version: 1;
	fetchedAt: string;
	value: T;
};

export type RefreshStage =
	'project-sessions' | 'scale-teams' | 'feedbacks' | 'scales' | 'teams' | 'transform' | 'publish';

export type RefreshStatus = {
	state: 'idle' | 'running' | 'failed';
	stage: RefreshStage | null;
	startedAt: string | null;
	finishedAt: string | null;
	lastSuccessfulAt: string | null;
	error: string | null;
};

export type ProjectEvaluationSummary = {
	projectId: number;
	projectSessionId: number;

	users: EvaluatedUserSummary[];
};

export type EvaluatedUserSummary = {
	id: number;
	login: string;

	teams: EvaluatedTeamSummary[];
};

export type EvaluatedTeamSummary = {
	id: number;

	finalMark: number | null;
	status: string | null;
	validated: boolean | null;

	repoUrl: string | null;
	repoUuid: string | null;

	evaluations: EvaluationSummary[];
};

export type EvaluationSummary = {
	id: number;

	finalMark: number | null;
	comment: string | null;
	filledAt: string | null;

	evaluator: {
		id: number;
		login: string;
	} | null;

	flag: {
		id: number;
		name: string;
		positive: boolean;
	} | null;

	feedbacks: EvaluationFeedbackSummary[];
};

export type EvaluationFeedbackSummary = {
	id: number | null;
	login: string | null;
	comment: string | null;
	rating: number | null;
	createdAt: string | null;
};
