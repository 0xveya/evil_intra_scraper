import campusUsersJson from './generated/campus-users.json';

export type CampusUser = { id: number; login: string; displayName: string };

const usersById = new Map<number, CampusUser>(campusUsersJson.users.map((user) => [user.id, user]));
const usersByLogin = new Map<string, CampusUser>(
	campusUsersJson.users.map((user) => [user.login, user])
);

export const campusUserCache = {
	campusId: campusUsersJson.campusId,
	cursusId: campusUsersJson.cursusId,
	users: [...usersById.values()],
	byId: (id: number) => usersById.get(id),
	byLogin: (login: string) => usersByLogin.get(login)
} as const;
