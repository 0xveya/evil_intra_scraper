<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Eval Dossier</title>
	<meta name="description" content="Inspect 42 project and evaluation data." />
	<meta name="theme-color" content="#050505" />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		color-scheme: dark;
		font-family: 'DM Mono', monospace;
		background: #050505;
		color: #f5f2e9;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		min-width: 20rem;
		min-height: 100dvh;
		background: radial-gradient(circle at 78% 8%, #173126 0, transparent 24rem), #050505;
	}
	:global(button),
	:global(select) {
		font: inherit;
	}
	:global(:focus-visible) {
		outline: 2px solid #b8ff5a;
		outline-offset: 3px;
	}
</style>
