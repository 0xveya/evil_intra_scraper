<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main>
	<div class="index">42 / EVAL INTELLIGENCE</div>
	<section>
		<p class="eyebrow">AUTHORIZED ACCESS ONLY</p>
		<h1>Find the failures<br /><i>before</i> they find you.</h1>
		<p class="lede">
			A small instrument for inspecting project data now, and evaluation feedback and edge cases
			later.
		</p>
		<a href={resolve('/login')}><span>Authenticate with 42</span><b>↗</b></a>
	</section>
	<footer>DATA SOURCE · 42 INTRA API</footer>
</main>

<style>
	main {
		min-height: 100dvh;
		padding: clamp(1.25rem, 4vw, 4rem);
		display: grid;
		grid-template-rows: auto 1fr auto;
	}
	.index,
	footer,
	.eyebrow {
		letter-spacing: 0.18em;
		font-size: 0.68rem;
		color: #a6a69e;
	}
	.index {
		border-bottom: 1px solid #2a2a27;
		padding-bottom: 1rem;
	}
	section {
		align-self: center;
		max-width: 64rem;
		padding: 4rem 0;
	}
	h1 {
		font-family: 'Syne', sans-serif;
		font-size: clamp(3rem, 9vw, 8rem);
		line-height: 0.88;
		letter-spacing: -0.065em;
		margin: 1.2rem 0 2rem;
	}
	h1 i {
		color: #b8ff5a;
		font-style: normal;
	}
	.lede {
		max-width: 39rem;
		color: #aaa9a1;
		line-height: 1.7;
		font-size: clamp(0.82rem, 1.4vw, 1rem);
	}
	a {
		margin-top: 2rem;
		width: min(100%, 22rem);
		min-height: 4rem;
		padding: 0 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #b8ff5a;
		color: #050505;
		text-decoration: none;
		font-weight: 500;
		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
	}
	a:hover {
		transform: translate(-3px, -3px);
		box-shadow: 7px 7px 0 #f5f2e9;
	}
	a b {
		font-size: 1.4rem;
	}
	footer {
		text-align: right;
	}
</style>
