<script lang="ts">
	import type { ProjectChoice } from '$lib/server/intra';

	let {
		projects,
		loading,
		canFetch,
		error,
		onSelect,
		onClear,
		onFetch
	}: {
		projects: ProjectChoice[];
		loading: boolean;
		canFetch: boolean;
		error: string | null;
		onSelect: (project: ProjectChoice) => void;
		onClear: () => void;
		onFetch: () => void | Promise<void>;
	} = $props();

	let search = $state('');
	let open = $state(false);

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
</script>

<div class="composer">
	<div class="inner">
		{#if open && search.trim()}
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

		<div class="row">
			<input
				type="search"
				aria-label="Search projects"
				placeholder="Search projects"
				bind:value={search}
				onfocus={() => (open = true)}
				oninput={() => {
					open = true;
					onClear();
				}}
			/>
			<button type="button" onclick={onFetch} disabled={loading || !canFetch}>
				{loading ? 'Fetching…' : 'Fetch'}
			</button>
		</div>

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
</style>
