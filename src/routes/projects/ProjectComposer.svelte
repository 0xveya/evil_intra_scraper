<script lang="ts">
	import type { ProjectChoice } from '$lib/server/intra';
	import type { EvaluationCopyMode, EvaluationFilter } from './evaluation-view';

	let {
		projects,
		loading,
		canFetch,
		mode,
		filter,
		filterMode,
		flags,
		selectedFlag,
		copyMessage,
		error,
		onSelect,
		onClear,
		onFetch,
		onFilter,
		onFilterMode,
		onFlag,
		onCopy,
		onRefresh,
		onChangeProject
	}: {
		projects: ProjectChoice[];
		loading: boolean;
		canFetch: boolean;
		mode: 'projects' | 'evaluations';
		filter: string;
		filterMode: EvaluationFilter;
		flags: string[];
		selectedFlag: string | null;
		copyMessage: string | null;
		error: string | null;
		onSelect: (project: ProjectChoice) => void;
		onClear: () => void;
		onFetch: () => void | Promise<void>;
		onFilter: (value: string) => void;
		onFilterMode: (value: EvaluationFilter) => void;
		onFlag: (value: string | null) => void;
		onCopy: (mode: EvaluationCopyMode) => void | Promise<void>;
		onRefresh: () => void | Promise<void>;
		onChangeProject: () => void;
	} = $props();

	let search = $state('');
	let open = $state(false);
	let panel = $state<'filter' | 'copy' | null>(null);
	let inner: HTMLDivElement;

	const matches = $derived(
		projects.filter((project) => {
			const query = search.trim().toLowerCase();
			return (
				!query || `${project.name} ${project.slug} ${project.id}`.toLowerCase().includes(query)
			);
		})
	);

	function select(project: ProjectChoice) {
		search = project.name;
		open = false;
		onSelect(project);
	}

	function completeProject(event: KeyboardEvent) {
		if ((event.key !== 'Enter' && event.key !== 'Tab') || !open || !search.trim()) return;

		const project = matches[0];
		if (!project) return;

		event.preventDefault();
		select(project);
	}

	function closePanels() {
		open = false;
		panel = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closePanels();
	}

	function handlePointerdown(event: PointerEvent) {
		if (event.target instanceof Node && !inner.contains(event.target)) closePanels();
	}

	function togglePanel(next: 'filter' | 'copy') {
		panel = panel === next ? null : next;
	}

	async function copy(mode: EvaluationCopyMode) {
		panel = null;
		await onCopy(mode);
	}
</script>

<svelte:window onkeydown={handleKeydown} onpointerdown={handlePointerdown} />

<div class="composer">
	<div class="inner" bind:this={inner}>
		{#if mode === 'projects' && open && search.trim()}
			<div class="suggestions">
				{#each matches.slice(0, 12) as project (project.id)}
					<button type="button" class="suggestion" onclick={() => select(project)}>
						<span>{project.name}</span>
						<small>{project.slug} · {project.id}</small>
					</button>
				{:else}
					<p>No projects found.</p>
				{/each}
			</div>
		{/if}
		<div class:explore={mode === 'evaluations'} class="row">
			{#if mode === 'evaluations'}
				<input
					type="search"
					aria-label="Search evaluations"
					placeholder="Search comments, users, feedback…"
					value={filter}
					oninput={(event) => onFilter(event.currentTarget.value)}
				/>
				<div class="control filter-control">
					<button
						type="button"
						class:active={filterMode !== 'all' || selectedFlag !== null}
						onclick={() => togglePanel('filter')}
					>
						{selectedFlag ?? (filterMode === 'all' ? 'Filter' : filterMode)}
					</button>
					{#if panel === 'filter'}
						<div class="panel filter-panel">
							<button class:active={filterMode === 'all'} onclick={() => onFilterMode('all')}
								>All</button
							>
							<button
								class:active={filterMode === 'failures'}
								onclick={() => onFilterMode('failures')}>Failures</button
							>
							<button class:active={filterMode === 'passed'} onclick={() => onFilterMode('passed')}
								>Passed</button
							>
							{#if flags.length}
								<hr />
								<button class:active={selectedFlag === null} onclick={() => onFlag(null)}
									>Any flag</button
								>
								{#each flags as flag (flag)}
									<button class:active={selectedFlag === flag} onclick={() => onFlag(flag)}
										>{flag}</button
									>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
				<div class="control copy-control">
					<button type="button" onclick={() => togglePanel('copy')}>Copy</button>
					{#if panel === 'copy'}
						<div class="panel copy-panel">
							<button onclick={() => copy('all')}>Current results</button>
							<button onclick={() => copy('failures')}>Current failures</button>
							<button onclick={() => copy('all-with-prompt')}>Current + analysis prompt</button>
							<button onclick={() => copy('failures-with-prompt')}
								>Failures + analysis prompt</button
							>
						</div>
					{/if}
				</div>
				<button type="button" class="secondary" onclick={onRefresh} disabled={loading}>
					{loading ? 'Refreshing…' : 'Refresh'}
				</button>
				<button type="button" onclick={onChangeProject}>Projects</button>
			{:else}
				<input
					type="search"
					aria-label="Search projects"
					placeholder="Search projects"
					bind:value={search}
					onfocus={() => (open = true)}
					onkeydown={completeProject}
					oninput={() => {
						open = true;
						onClear();
					}}
				/>
				<button type="button" onclick={onFetch} disabled={loading || !canFetch}>
					{loading ? 'Fetching…' : 'Fetch'}
				</button>
			{/if}
		</div>
		{#if mode === 'evaluations' && copyMessage}<p class="copy-message">{copyMessage}</p>{/if}

		{#if error}<p class="error">{error}</p>{/if}
	</div>
</div>

<style>
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
	.inner {
		position: relative;
		width: min(62rem, 100%);
		margin: auto;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.6rem;
	}
	.row.explore {
		grid-template-columns: minmax(0, 1fr) auto auto auto auto;
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
	button.secondary {
		border-color: #2d2d2d;
		color: #999;
		background: #090909;
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
	.panel {
		position: absolute;
		bottom: calc(100% + 0.6rem);
		width: max-content;
		max-width: min(30rem, calc(100vw - 2rem));
		padding: 0.3rem;
		border: 1px solid #444;
		border-radius: 0.35rem;
		background: #080808;
	}
	.control {
		position: relative;
		display: flex;
	}
	.control > button {
		width: 100%;
	}
	.filter-panel {
		left: 0;
	}
	.copy-panel {
		right: 0;
	}
	.panel button {
		display: block;
		width: 100%;
		min-height: 0;
		padding: 0.55rem 0.7rem;
		border: 0;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.panel button:hover,
	.panel button.active,
	.row button.active {
		background: #222;
		color: #fff;
	}
	.panel hr {
		margin: 0.3rem 0;
		border: 0;
		border-top: 1px solid #333;
	}
	.filter-panel {
		max-height: min(24rem, 55dvh);
		overflow: auto;
	}
	.suggestions p {
		margin: 0;
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
		margin: 0.6rem 0 0;
		padding: 0.6rem;
		border: 1px solid #743c3c;
		color: #f0a0a0;
		font-size: 0.8rem;
	}
	.copy-message {
		position: absolute;
		bottom: calc(100% + 0.6rem);
		left: 0;
		margin: 0;
		padding: 0.35rem 0.5rem;
		background: #080808;
		color: #777;
		font-size: 0.72rem;
	}
	@media (max-width: 700px) {
		.row.explore {
			grid-template-columns: minmax(0, 1fr) auto auto auto;
		}
		.row.explore button:last-child {
			display: none;
		}
	}
</style>
