/*
import type { ResultAsync } from 'neverthrow';

import type {
	CachedValue,
	EvaluationCacheError,
	ProjectEvaluationDump,
	ProjectEvaluationIndex,
	RefreshStatus
} from './types';

export function getProjectDump(
	projectId: number
): ResultAsync<ProjectEvaluationDump | null, EvaluationCacheError>;

export function getProjectIndex(
	projectId: number
): ResultAsync<ProjectEvaluationIndex | null, EvaluationCacheError>;

export function getRefreshStatus(
	projectId: number
): ResultAsync<RefreshStatus | null, EvaluationCacheError>;

export function setRefreshStatus(
	projectId: number,
	status: RefreshStatus
): ResultAsync<void, EvaluationCacheError>;

export function publishProject(
	projectId: number,
	dump: ProjectEvaluationDump,
	index: ProjectEvaluationIndex
): ResultAsync<void, EvaluationCacheError>;

export function acquireProjectLock(
	projectId: number,
	owner: string,
	lifetimeSeconds?: number
): ResultAsync<boolean, EvaluationCacheError>;

export function releaseProjectLock(
	projectId: number,
	owner: string
): ResultAsync<boolean, EvaluationCacheError>;

export function getScale(scaleId: number): ResultAsync<unknown | null, EvaluationCacheError>;

export function putScale(scaleId: number, value: unknown): ResultAsync<void, EvaluationCacheError>;

export function getTeam(teamId: number): ResultAsync<unknown | null, EvaluationCacheError>;

export function putTeam(teamId: number, value: unknown): ResultAsync<void, EvaluationCacheError>;

export function getFeedbacks(
	scaleTeamId: number
): ResultAsync<unknown[] | null, EvaluationCacheError>;

export function putFeedbacks(
	scaleTeamId: number,
	value: unknown[]
): ResultAsync<void, EvaluationCacheError>;

function readJson<T>(key: string): ResultAsync<T | null, EvaluationCacheError>;

function writeJson<T>(key: string, value: T): ResultAsync<void, EvaluationCacheError>;

function projectDumpKey(projectId: number): string;
function projectIndexKey(projectId: number): string;
function projectStatusKey(projectId: number): string;
function projectLockKey(projectId: number): string;
function scaleKey(scaleId: number): string;
function teamKey(teamId: number): string;
function feedbacksKey(scaleTeamId: number): string;
*/
