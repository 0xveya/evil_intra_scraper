import * as v from 'valibot';

export const projectSessionSchema = v.looseObject({
	id: v.number()
});

export type ProjectSession = v.InferOutput<typeof projectSessionSchema>;

export const userRefSchema = v.looseObject({
	id: v.number(),
	login: v.string(),
	url: v.optional(v.string())
});

export type UserRef = v.InferOutput<typeof userRefSchema>;

export const scaleRefSchema = v.looseObject({
	id: v.number(),
	name: v.optional(v.string())
});

export type ScaleRef = v.InferOutput<typeof scaleRefSchema>;

const teamUserSchema = v.looseObject({
	id: v.number(),
	login: v.optional(v.string()),
	validated: v.optional(v.nullable(v.boolean())),
	projects_user_id: v.optional(v.number())
});

export const teamRefSchema = v.looseObject({
	id: v.number(),
	name: v.optional(v.string()),
	project_id: v.optional(v.number()),
	url: v.optional(v.string()),
	final_mark: v.optional(v.nullable(v.number())),
	status: v.optional(v.string()),
	repo_url: v.optional(v.nullable(v.string())),
	repo_uuid: v.optional(v.nullable(v.string())),
	users: v.optional(v.array(teamUserSchema), [])
});

export type TeamRef = v.InferOutput<typeof teamRefSchema>;

export const scaleTeamSchema = v.looseObject({
	id: v.number(),
	begin_at: v.optional(v.string()),
	filled_at: v.optional(v.nullable(v.string())),
	final_mark: v.optional(v.nullable(v.number())),
	comment: v.optional(v.nullable(v.string())),
	corrector: v.optional(v.nullable(userRefSchema)),
	correcteds: v.optional(v.union([v.array(userRefSchema), v.literal('invisible')])),
	scale: v.optional(scaleRefSchema),
	team: v.optional(teamRefSchema),
	feedbacks: v.optional(v.array(v.unknown())),
	flag: v.optional(
		v.nullable(
			v.looseObject({
				id: v.number(),
				name: v.string(),
				positive: v.boolean()
			})
		)
	)
});

export type ScaleTeam = v.InferOutput<typeof scaleTeamSchema>;

export const storedEntitySchema = v.looseObject({
	id: v.number()
});

export type StoredEntity = v.InferOutput<typeof storedEntitySchema>;
