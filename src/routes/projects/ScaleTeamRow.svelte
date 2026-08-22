<script lang="ts">
	import type { ScaleTeam } from '$lib/server/evals/schemas';

	let { scaleTeam, projectSlug }: { scaleTeam: ScaleTeam; projectSlug: string } = $props();

	const correctedUsers = $derived(Array.isArray(scaleTeam.correcteds) ? scaleTeam.correcteds : []);
	const projectUrl = $derived(
		`https://projects.intra.42.fr/projects/${encodeURIComponent(projectSlug)}`
	);
	const attemptUrl = $derived.by(() => {
		const projectsUserId = scaleTeam.team?.users[0]?.projects_user_id;
		return projectsUserId ? `${projectUrl}/projects_users/${projectsUserId}` : projectUrl;
	});

	function profileUrl(login: string): string {
		return `https://profile.intra.42.fr/users/${encodeURIComponent(login)}`;
	}

	function formatDate(value: string | null | undefined): string {
		if (!value) return 'not completed';
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->

<article>
	<header>
		<div>
			<a href={attemptUrl} target="_blank" rel="noreferrer">
				<strong>{scaleTeam.team?.name ?? `team #${scaleTeam.team?.id ?? scaleTeam.id}`}</strong>
			</a>
			<span>evaluation #{scaleTeam.id}</span>
		</div>
		<strong
			class:positive={scaleTeam.flag?.positive === true}
			class:negative={scaleTeam.flag?.positive === false}
		>
			{scaleTeam.final_mark ?? '—'}
		</strong>
	</header>

	<div class="people">
		{#if scaleTeam.corrector}
			<a href={profileUrl(scaleTeam.corrector.login)} target="_blank" rel="noreferrer">
				{scaleTeam.corrector.login}
			</a>
		{:else}
			<span>unknown evaluator</span>
		{/if}
		<span>→</span>
		{#each correctedUsers as user (user.id)}
			<a href={profileUrl(user.login)} target="_blank" rel="noreferrer">{user.login}</a>
		{:else}
			<span>hidden users</span>
		{/each}
	</div>

	<div class="metadata">
		<time datetime={scaleTeam.filled_at ?? undefined}>{formatDate(scaleTeam.filled_at)}</time>
		{#if scaleTeam.flag}<span>{scaleTeam.flag.name}</span>{/if}
		{#if scaleTeam.team?.status}<span>{scaleTeam.team.status}</span>{/if}
	</div>

	{#if scaleTeam.comment}<p class="comment">{scaleTeam.comment}</p>{/if}

	<details>
		<summary>JSON</summary>
		<pre>{JSON.stringify(scaleTeam, null, 2)}</pre>
	</details>
</article>

<style>
	article {
		margin: 0 0.5rem;
		padding: 0.85rem 0.25rem;
		border-bottom: 1px solid #282828;
	}
	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	header div,
	header span {
		display: block;
	}
	header span {
		margin-top: 0.2rem;
		color: #777;
		font-size: 0.72rem;
	}
	a {
		color: #ddd;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
	.positive {
		color: #78c58b;
	}
	.negative {
		color: #e87979;
	}
	.people,
	.metadata {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.35rem;
		color: #999;
		font-size: 0.8rem;
	}
	.metadata {
		color: #777;
		font-size: 0.72rem;
	}
	.metadata span::before {
		content: '· ';
	}
	.comment {
		margin: 0.7rem 0 0;
		padding-left: 0.65rem;
		border-left: 2px solid #333;
		color: #bbb;
		font-size: 0.82rem;
		line-height: 1.45;
	}
	details {
		margin-top: 0.65rem;
	}
	summary {
		cursor: pointer;
		color: #aaa;
		font-size: 0.75rem;
	}
	pre {
		margin: 0.5rem 0 0;
		padding: 0.75rem;
		overflow: auto;
		background: #020202;
		color: #bbb;
		font: 0.75rem/1.45 monospace;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
