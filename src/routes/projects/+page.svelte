<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	let { data, form } = $props();
	let loading = $state(false);
	let search = $state('');
	const matchingProjects = $derived(
		data.projects.filter((project) => {
			const query = search.trim().toLowerCase();
			return (
				!query || `${project.name} ${project.slug} ${project.id}`.toLowerCase().includes(query)
			);
		})
	);
	const response = $derived(form && 'response' in form ? form.response : null);
</script>

<svelte:head><title>Projects · evil_intra_scraper</title></svelte:head>
<main>
	<header>
		<h1>evil_intra_scraper</h1>
		<p>{data.user} · <a href={resolve('/logout')}>sign out</a></p>
	</header>
	<section>
		<div class="controls">
			<label for="projectSearch">Search projects</label>
			<input id="projectSearch" type="search" placeholder="Name, slug, or ID" bind:value={search} />
			<form
				method="POST"
				action="?/project"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<label for="projectId">Project</label>
				<select id="projectId" name="projectId" required disabled={data.projects.length === 0}>
					<option value="">Choose one…</option>
					{#each matchingProjects as project (project.id)}<option
							value={project.id}
							selected={form && 'selectedId' in form && form.selectedId === project.id}
							>{project.name} ({project.id})</option
						>{/each}
				</select>
				<button disabled={loading || data.projects.length === 0}>
					{loading ? 'Fetching…' : 'Fetch project JSON'}
				</button>
			</form>
			{#if form && 'message' in form}<p class="error">{form.message}</p>{/if}
		</div>
		<div class="result">
			<h2>Response</h2>
			<pre>{response
					? JSON.stringify(response, null, 2)
					: 'Select a project to inspect its JSON response.'}</pre>
		</div>
	</section>
</main>

<style>
	main {
		width: min(64rem, 100%);
		margin: auto;
		padding: 1rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #333;
	}
	h1 {
		margin: 0;
		font-size: 1.25rem;
	}
	header p {
		margin: 0;
		color: #aaa;
		font-size: 0.85rem;
	}
	header a {
		color: #ccc;
	}
	section {
		display: grid;
		grid-template-columns: 17rem minmax(0, 1fr);
		gap: 1rem;
		padding-top: 1rem;
	}
	.controls,
	.result {
		min-width: 0;
	}
	label {
		display: block;
		margin: 1rem 0 0.4rem;
		font-size: 0.85rem;
	}
	input,
	select,
	button {
		width: 100%;
		min-height: 2.6rem;
		border: 1px solid #444;
		border-radius: 0.3rem;
	}
	input,
	select {
		padding: 0 0.6rem;
		color: #eee;
		background: #111;
	}
	button {
		margin-top: 0.6rem;
		padding: 0 0.7rem;
		background: #222;
		color: #eee;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.45;
		cursor: wait;
	}
	h2 {
		margin: 0 0 0.4rem;
		font-size: 0.9rem;
	}
	pre {
		min-height: 22rem;
		margin: 0;
		padding: 1rem;
		overflow: auto;
		border: 1px solid #333;
		border-radius: 0.3rem;
		background: #0d0d0d;
		color: #ccc;
		font: 0.8rem/1.5 monospace;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.error {
		padding: 0.7rem;
		border: 1px solid #743c3c;
		border-radius: 0.3rem;
		background: #1b0e0e;
		color: #f0a0a0;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	@media (max-width: 700px) {
		header {
			flex-direction: column;
		}
		section {
			grid-template-columns: 1fr;
		}
	}
</style>
