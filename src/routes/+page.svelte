<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main>
	<h1>evil_intra_scraper</h1>
	<p>Inspect project data from the 42 Intra API.</p>
	<a href={resolve('/login')}>Sign in with 42</a>
</main>

<style>
	main {
		width: min(32rem, calc(100% - 2rem));
		margin: 5rem auto;
	}
	h1 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	p {
		color: #aaa;
		line-height: 1.5;
	}
	a {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.7rem 0.9rem;
		border: 1px solid #555;
		border-radius: 0.35rem;
		background: #161616;
		color: #eee;
		text-decoration: none;
	}
	a:hover {
		background: #222;
	}
</style>
