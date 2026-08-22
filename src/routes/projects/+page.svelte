<script lang="ts">
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { resolve } from '$app/paths';
	import type { ScaleTeam } from '$lib/server/evals/schemas';
	import type { ProjectChoice } from '$lib/server/intra';
	import ProjectComposer from './ProjectComposer.svelte';
	import ScaleTeamRow from './ScaleTeamRow.svelte';
	import { fetchProjectSessions, streamScaleTeams } from './projects.remote';

	let { data } = $props();
	let selectedProject = $state<ProjectChoice | null>(null);
	let scaleTeams = $state<ScaleTeam[]>([]);
	let remoteError = $state<string | null>(null);
	let loading = $state(false);
	let loadedProjectId = $state<number | null>(null);
	let loadedPages = $state(0);
	let streamComplete = $state(false);
	let copyMenuOpen = $state(false);
	let copyMessage = $state<string | null>(null);
	let fetchGeneration = 0;

	const projectUrl = $derived(
		selectedProject
			? `https://projects.intra.42.fr/projects/${encodeURIComponent(selectedProject.slug)}`
			: null
	);
	const selectedProjectSlug = $derived(selectedProject?.slug ?? '');

	function selectProject(project: ProjectChoice) {
		selectedProject = project;
		if (loadedProjectId !== project.id) scaleTeams = [];
	}

	function clearProject() {
		selectedProject = null;
	}

	async function fetchSelectedProject() {
		if (!selectedProject) return;

		const project = selectedProject;
		const generation = ++fetchGeneration;
		loading = true;
		remoteError = null;
		loadedPages = 0;
		streamComplete = false;

		if (loadedProjectId !== project.id) {
			scaleTeams = [];
			loadedProjectId = project.id;
		}

		try {
			const sessions = await fetchProjectSessions(project.id);
			const projectSession = sessions[0];

			if (!projectSession) {
				scaleTeams = [];
				streamComplete = true;
				return;
			}

			for await (const update of streamScaleTeams(projectSession.id)) {
				if (generation !== fetchGeneration) break;
				scaleTeams = update.items;
				loadedPages = update.page;
				streamComplete = update.complete;
			}
		} catch (cause) {
			if (generation !== fetchGeneration) return;
			remoteError = cause instanceof Error ? cause.message : 'Request failed';
		} finally {
			if (generation === fetchGeneration) loading = false;
		}
	}

	type CopyMode = 'all' | 'failures';

	function isFailure(scaleTeam: ScaleTeam): boolean {
		return (
			scaleTeam.flag?.positive === false ||
			scaleTeam.team?.users.some((user) => user.validated === false) === true
		);
	}

	async function copyResults(mode: CopyMode) {
		const results = mode === 'failures' ? scaleTeams.filter(isFailure) : scaleTeams;
		copyMenuOpen = false;

		try {
			await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
			copyMessage = `Copied ${results.length} ${mode === 'failures' ? 'failures' : 'evaluations'}`;
		} catch {
			copyMessage = 'Could not copy';
		}
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->

<svelte:head><title>Projects · evil_intra_scraper</title></svelte:head>

<main>
	<header class="page-header">
		<h1>evil_intra_scraper</h1>
		<p>{data.user} · <a href={resolve('/logout')}>sign out</a></p>
	</header>

	<section>
		<div class="result-heading">
			<h2>
				{#if projectUrl}
					<a href={projectUrl} target="_blank" rel="noreferrer">{selectedProject?.name}</a>
				{:else}
					Scale teams
				{/if}
			</h2>
			<div class="result-actions">
				<span>
					{scaleTeams.length}
					{#if loading && loadedPages}· page {loadedPages}{:else if streamComplete}· complete{/if}
				</span>
				{#if scaleTeams.length}
					<details class="copy" bind:open={copyMenuOpen}>
						<summary>Copy</summary>
						<div class="copy-menu">
							<button onclick={() => copyResults('all')}>All evaluations</button>
							<button onclick={() => copyResults('failures')}>Failures only</button>
						</div>
					</details>
				{/if}
				{#if copyMessage}<span class="copy-message">{copyMessage}</span>{/if}
			</div>
		</div>

		{#if loading && !scaleTeams.length}
			<div class="loading-state">
				<span></span>
				<p>Opening {selectedProject?.name}…</p>
			</div>
		{:else if scaleTeams.length && selectedProject}
			<div class="list-shell">
				<SvelteVirtualList
					items={scaleTeams}
					itemKey={(scaleTeam) => scaleTeam.id}
					defaultEstimatedItemSize={150}
					bufferSize={8}
					viewportLabel="Scale teams"
				>
					{#snippet renderItem(scaleTeam)}
						<ScaleTeamRow {scaleTeam} projectSlug={selectedProjectSlug} />
					{/snippet}
				</SvelteVirtualList>
			</div>
		{:else}
			<p class="empty">Choose a project below.</p>
		{/if}
	</section>
</main>

<ProjectComposer
	projects={data.projects}
	{loading}
	canFetch={selectedProject !== null}
	error={remoteError}
	onSelect={selectProject}
	onClear={clearProject}
	onFetch={fetchSelectedProject}
/>

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
	.result-heading a {
		color: #ddd;
		text-decoration: none;
	}
	.result-heading a:hover {
		text-decoration: underline;
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
	.empty {
		margin: auto;
		color: #777;
	}
	.loading-state {
		display: flex;
		margin: auto;
		align-items: center;
		gap: 0.65rem;
		color: #888;
	}
	.loading-state span {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: #bbb;
		animation: pulse 0.9s ease-in-out infinite alternate;
	}
	@keyframes pulse {
		to {
			opacity: 0.2;
		}
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
	.result-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.copy {
		position: relative;
	}
	.copy summary {
		border: 0;
		padding: 0;
		background: transparent;
		color: #aaa;
		font: inherit;
		cursor: pointer;
		list-style: none;
	}
	.copy summary::-webkit-details-marker {
		display: none;
	}
	.copy summary::after {
		content: ' ▾';
	}
	.copy summary:hover {
		color: #fff;
	}
	.copy-menu {
		position: absolute;
		z-index: 2;
		top: calc(100% + 0.4rem);
		right: 0;
		padding: 0.3rem;
		border: 1px solid #333;
		border-radius: 0.4rem;
		background: #111;
	}
	.copy-menu button {
		display: block;
		width: 100%;
		border: 0;
		border-radius: 0.25rem;
		padding: 0.45rem 0.65rem;
		background: transparent;
		color: #ccc;
		font: inherit;
		text-align: left;
		white-space: nowrap;
		cursor: pointer;
	}
	.copy-menu button:hover {
		background: #222;
		color: #fff;
	}
	.copy-message {
		color: #777;
	}
</style>
