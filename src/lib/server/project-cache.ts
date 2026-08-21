import projectsJson from './generated/projects.json';
import type { ProjectChoice } from './intra';

const projects = new Map<number, ProjectChoice>(
	projectsJson.map((project) => [project.id, project])
);

export function getCachedProjects(): ProjectChoice[] {
	return [...projects.values()];
}

export function getCachedProject(id: number): ProjectChoice | undefined {
	return projects.get(id);
}
