<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>evil_intra_scraper</title>
	<meta name="description" content="Inspect 42 project and evaluation data." />
	<meta name="theme-color" content="#050505" />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		color-scheme: dark;
		font-family: sans-serif;
		background: #080808;
		color: #eee;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		min-width: 20rem;
		min-height: 100dvh;
		background: #080808;
	}
	:global(button),
	:global(select) {
		font: inherit;
	}
	:global(:focus-visible) {
		outline: 2px solid #8ab4f8;
		outline-offset: 2px;
	}
</style>
