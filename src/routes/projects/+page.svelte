<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { resolve } from '$app/paths';
	import type { ScaleTeam } from '$lib/server/evals/schemas';
	import { fetchProjectSessions, fetchScaleTeams } from './projects.remote';

	let { data } = $props();
	let search = $state('');
	let selectedProjectId = $state<number | null>(null);
	let scaleTeams = $state<ScaleTeam[]>([]);
	let remoteError = $state<string | null>(null);
	let loading = $state(false);
	let suggestionsOpen = $state(false);

	const matchingProjects = $derived(
		data.projects.filter((project) => {
			const query = search.trim().toLowerCase();
			return (
				!query || `${project.name} ${project.slug} ${project.id}`.toLowerCase().includes(query)
			);
		})
	);

	function selectProject(project: (typeof data.projects)[number]) {
		selectedProjectId = project.id;
		search = project.name;
		suggestionsOpen = false;
		scaleTeams = [];
	}

	async function fetchSelectedProject() {
		if (selectedProjectId === null) return;
		const projectId = selectedProjectId;
		loading = true;
		remoteError = null;

		try {
			const sessions = await fetchProjectSessions(projectId);
			const projectSession = sessions[0];
			scaleTeams = projectSession ? await fetchScaleTeams(projectSession.id) : [];
			suggestionsOpen = false;
		} catch (cause) {
			remoteError = cause instanceof Error ? cause.message : 'Request failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>Projects · evil_intra_scraper</title></svelte:head>

<main>
	<header class="page-header">
		<h1>evil_intra_scraper</h1>
		<p>{data.user} · <a href={resolve('/logout')}>sign out</a></p>
	</header>

	<section>
		<div class="result-heading">
			<h2>Scale teams</h2>
			<span>{scaleTeams.length}</span>
		</div>

		{#if scaleTeams.length}
			<div class="list-shell">
				<SvelteVirtualList
					items={scaleTeams}
					itemKey={(scaleTeam) => scaleTeam.id}
					defaultEstimatedItemSize={150}
					bufferSize={8}
					viewportLabel="Scale teams"
				>
					{#snippet renderItem(scaleTeam)}
						<article class="scale-team">
							<header>
								<strong>#{scaleTeam.id}</strong>
								<span>{scaleTeam.team?.name ?? 'unknown team'}</span>
							</header>
							<p>
								{scaleTeam.corrector?.login ?? 'unknown evaluator'}
								· {scaleTeam.final_mark ?? '—'}
							</p>
							<details>
								<summary>JSON</summary>
								<pre>{JSON.stringify(scaleTeam, null, 2)}</pre>
							</details>
						</article>
					{/snippet}
				</SvelteVirtualList>
			</div>
		{:else}
			<p class="empty">Choose a project below.</p>
		{/if}
	</section>
</main>

<div class="composer">
	<div class="composer-inner">
		{#if suggestionsOpen && search.trim()}
			<div class="suggestions">
				{#each matchingProjects.slice(0, 12) as project (project.id)}
					<button type="button" class="suggestion" onclick={() => selectProject(project)}>
						<span>{project.name}</span>
						<small>{project.slug} · {project.id}</small>
					</button>
				{:else}
					<p>No projects found.</p>
				{/each}
			</div>
		{/if}

		<div class="composer-row">
			<input
				id="projectSearch"
				type="search"
				aria-label="Search projects"
				placeholder="Search projects"
				bind:value={search}
				onfocus={() => (suggestionsOpen = true)}
				oninput={() => {
					selectedProjectId = null;
					suggestionsOpen = true;
				}}
			/>

			<button
				type="button"
				onclick={fetchSelectedProject}
				disabled={loading || selectedProjectId === null}
			>
				{loading ? 'Fetching…' : 'Fetch'}
			</button>
		</div>

		{#if remoteError}<p class="error">{remoteError}</p>{/if}
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
	main {
		box-sizing: border-box;
		width: min(64rem, 100%);
		height: 100dvh;
		margin: auto;
		padding: 1rem 1rem 6.5rem;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		height: 2.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #333;
	}
	h1,
	h2,
	p {
		margin: 0;
	}
	h1 {
		font-size: 1.25rem;
	}
	h2 {
		font-size: 0.85rem;
	}
	.page-header p,
	.page-header a {
		color: #aaa;
	}
	section {
		display: flex;
		min-height: 0;
		height: calc(100% - 3.25rem);
		flex-direction: column;
		padding-top: 1rem;
	}
	.result-heading {
		display: flex;
		justify-content: space-between;
		padding-bottom: 0.5rem;
		color: #aaa;
		font-size: 0.8rem;
	}
	.list-shell {
		min-height: 0;
		flex: 1;
		border: 1px solid #333;
		background: #080808;
	}
	.list-shell :global(.virtual-list-container) {
		height: 100%;
	}
	.scale-team {
		margin: 0 0.5rem;
		padding: 0.85rem 0.25rem;
		border-bottom: 1px solid #282828;
	}
	.scale-team header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.scale-team p {
		margin-top: 0.35rem;
		color: #999;
		font-size: 0.8rem;
	}
	.scale-team details {
		margin-top: 0.65rem;
	}
	.scale-team summary {
		cursor: pointer;
		color: #aaa;
		font-size: 0.75rem;
	}
	.scale-team pre {
		margin: 0.5rem 0 0;
		padding: 0.75rem;
		overflow: auto;
		background: #020202;
		color: #bbb;
		font: 0.75rem/1.45 monospace;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.empty {
		margin: auto;
		color: #777;
	}
	.composer {
		position: fixed;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		padding: 0.8rem 1rem 1rem;
		border-top: 1px solid #333;
		background: #050505;
	}
	.composer-inner {
		position: relative;
		width: min(62rem, 100%);
		margin: auto;
	}
	.composer-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.6rem;
	}
	input,
	button {
		box-sizing: border-box;
		min-height: 2.8rem;
		border: 1px solid #444;
		border-radius: 0.35rem;
		color: #eee;
		background: #111;
	}
	input {
		min-width: 0;
		padding: 0 0.75rem;
	}
	button {
		padding: 0 1rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.suggestions {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.6rem);
		left: 0;
		max-height: min(22rem, 50dvh);
		overflow: auto;
		border: 1px solid #444;
		background: #050505;
	}
	.suggestions p {
		padding: 0.75rem;
		color: #888;
		font-size: 0.8rem;
	}
	.suggestion {
		display: block;
		width: 100%;
		min-height: 0;
		padding: 0.65rem;
		border: 0;
		border-bottom: 1px solid #222;
		border-radius: 0;
		text-align: left;
	}
	.suggestion:hover,
	.suggestion:focus-visible {
		background: #161616;
	}
	.suggestion span,
	.suggestion small {
		display: block;
	}
	.suggestion small {
		margin-top: 0.15rem;
		color: #888;
	}
	.error {
		margin-top: 0.6rem;
		padding: 0.6rem;
		border: 1px solid #743c3c;
		color: #f0a0a0;
		font-size: 0.8rem;
	}
	@media (max-width: 700px) {
		.page-header {
			height: auto;
			flex-direction: column;
		}
		section {
			height: calc(100% - 4.5rem);
		}
	}
</style>
