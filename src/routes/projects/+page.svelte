<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	let { data, form } = $props();
	let loading = $state(false);
	const response = $derived(form && 'response' in form ? form.response : null);
</script>

<svelte:head><title>Projects · Eval Dossier</title></svelte:head>
<main>
	<header>
		<div>
			<span>42 / PROJECT INDEX</span>
			<h1>Select a dossier.</h1>
		</div>
		<div class="identity"><i></i>{data.user}<a href={resolve('/logout')}>sign out</a></div>
	</header>
	<div class="workspace">
		<aside>
			<p class="label">QUERY</p>
			<form
				method="POST"
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
					{#each data.projects as project (project.id)}<option
							value={project.id}
							selected={form && 'selectedId' in form && form.selectedId === project.id}
							>{project.name}</option
						>{/each}
				</select>
				<button disabled={loading || data.projects.length === 0}
					>{loading ? 'Fetching…' : 'Fetch project JSON'}<b>→</b></button
				>
			</form>
			{#if data.loadError}<p class="error">{data.loadError}</p>{/if}
			{#if form && 'message' in form}<p class="error">{form.message}</p>{/if}
		</aside>
		<section>
			<div class="result-head">
				<p class="label">RESPONSE</p>
				<span>{response ? '200 · APPLICATION/JSON' : 'WAITING FOR QUERY'}</span>
			</div>
			<pre>{response
					? JSON.stringify(response, null, 2)
					: '// Authenticate, select a project, inspect the payload.'}</pre>
		</section>
	</div>
</main>

<style>
	main {
		width: min(92rem, 100%);
		min-height: 100dvh;
		margin: auto;
		padding: clamp(1.1rem, 3vw, 3rem);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		padding-bottom: 2.2rem;
		border-bottom: 1px solid #2c2c29;
	}
	header span,
	.label,
	.result-head span {
		font-size: 0.65rem;
		letter-spacing: 0.17em;
		color: #85857e;
	}
	h1 {
		font:
			700 clamp(2.1rem, 5vw, 4.6rem)/0.95 'Syne',
			sans-serif;
		letter-spacing: -0.055em;
		margin: 0.8rem 0 0;
	}
	.identity {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.72rem;
	}
	.identity i {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #b8ff5a;
		box-shadow: 0 0 12px #b8ff5a;
	}
	.identity a {
		color: #85857e;
		margin-left: 0.5rem;
	}
	.workspace {
		display: grid;
		grid-template-columns: minmax(15rem, 22rem) 1fr;
		min-height: 34rem;
	}
	aside {
		padding: 2rem 2rem 2rem 0;
		border-right: 1px solid #2c2c29;
	}
	section {
		min-width: 0;
		padding: 2rem 0 0 2rem;
	}
	label {
		display: block;
		margin: 2.5rem 0 0.7rem;
		font-size: 0.75rem;
		color: #aaa9a1;
	}
	select,
	button {
		width: 100%;
		min-height: 3.4rem;
		border: 1px solid #343430;
		border-radius: 0;
	}
	select {
		padding: 0 0.8rem;
		color: #f5f2e9;
		background: #0d0d0c;
	}
	button {
		margin-top: 0.8rem;
		padding: 0 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-color: #b8ff5a;
		background: #b8ff5a;
		color: #080808;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.45;
		cursor: wait;
	}
	button b {
		font-size: 1.2rem;
	}
	.result-head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.result-head p {
		margin-top: 0;
	}
	pre {
		min-height: 28rem;
		margin: 1.55rem 0 0;
		padding: 1.5rem;
		overflow: auto;
		border: 1px solid #232321;
		background: #090909;
		color: #c8c8c0;
		font:
			300 0.76rem/1.65 'DM Mono',
			monospace;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.error {
		padding: 0.8rem;
		border-left: 2px solid #ff604f;
		background: #1c0d0b;
		color: #ff9589;
		font-size: 0.72rem;
		line-height: 1.5;
	}
	@media (max-width: 700px) {
		header {
			flex-direction: column;
		}
		.workspace {
			grid-template-columns: 1fr;
		}
		aside {
			border-right: 0;
			border-bottom: 1px solid #2c2c29;
			padding-right: 0;
		}
		section {
			padding-left: 0;
		}
	}
</style>
