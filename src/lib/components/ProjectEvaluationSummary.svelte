<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProjectEvaluationSummary } from '$lib/server/evals/types';

	let {
		summary
	}: {
		summary: ProjectEvaluationSummary;
	} = $props();

	function profileUrl(login: string) {
		return `https://profile.intra.42.fr/users/${login}`;
	}

	function formatDate(value: string | null) {
		if (!value) return '—';

		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->

<main>
	<header class="page-header">
		<div>
			<h1>Evaluations</h1>
			<p>
				{summary.users.length} users
			</p>
		</div>

		<a href={resolve('/')}>projects</a>
	</header>

	<div class="users">
		{#each summary.users as user (user.id)}
			<section class="user">
				<header class="user-header">
					<div>
						<a class="login" href={profileUrl(user.login)} target="_blank" rel="noreferrer">
							{user.login}
						</a>

						<span class="muted">
							#{user.id}
						</span>
					</div>

					<span class="muted">
						{user.teams.length}
						{user.teams.length === 1 ? 'attempt' : 'attempts'}
					</span>
				</header>

				<div class="teams">
					{#each user.teams as team (team.id)}
						<article class="team">
							<header class="team-header">
								<div>
									<strong>
										{team.finalMark ?? '—'}
									</strong>

									{#if team.validated !== null}
										<span class="muted">
											·
											{team.validated ? 'validated' : 'not validated'}
										</span>
									{/if}

									{#if team.status}
										<span class="muted">
											· {team.status}
										</span>
									{/if}
								</div>

								<span class="muted">
									team #{team.id}
								</span>
							</header>

							{#if team.repoUrl}
								<div class="repo">
									<span>repo</span>
									<code>{team.repoUrl}</code>
								</div>
							{/if}

							<div class="evaluations">
								{#each team.evaluations as evaluation (evaluation.id)}
									<details class="evaluation">
										<summary>
											<div class="summary-main">
												<div>
													{#if evaluation.evaluator}
														<a
															href={profileUrl(evaluation.evaluator.login)}
															target="_blank"
															rel="noreferrer"
															onclick={(event) => event.stopPropagation()}
														>
															{evaluation.evaluator.login}
														</a>
													{:else}
														<span>unknown evaluator</span>
													{/if}

													<span class="muted">
														→ {user.login}
													</span>
												</div>

												<time class="muted" datetime={evaluation.filledAt ?? undefined}>
													{formatDate(evaluation.filledAt)}
												</time>
											</div>

											<strong>
												{evaluation.finalMark ?? '—'}
											</strong>
										</summary>

										<div class="evaluation-body">
											{#if evaluation.flag}
												<div>
													<span class="label">flag</span>

													<span>
														{evaluation.flag.name}
													</span>
												</div>
											{/if}

											{#if evaluation.comment}
												<div>
													<span class="label">comment</span>
													<p>{evaluation.comment}</p>
												</div>
											{/if}

											{#if evaluation.feedbacks.length}
												<div>
													<span class="label">feedback</span>

													<div class="feedbacks">
														{#each evaluation.feedbacks as feedback, index (feedback.id ?? index)}
															<div class="feedback">
																<p>
																	{feedback.comment ?? '—'}
																</p>

																<div class="muted">
																	{#if feedback.login}
																		{feedback.login}
																	{/if}

																	{#if feedback.rating !== null}
																		· {feedback.rating}/5
																	{/if}
																</div>
															</div>
														{/each}
													</div>
												</div>
											{/if}

											<details class="raw">
												<summary>details</summary>

												<pre>{JSON.stringify(evaluation, null, 2)}</pre>
											</details>
										</div>
									</details>
								{/each}
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0d0d0d;
		color: #ddd;
		font-family: system-ui, sans-serif;
	}

	main {
		width: min(52rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: 2rem 0 5rem;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.page-header,
	.user-header,
	.team-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header {
		margin-bottom: 3rem;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
	}

	.page-header p {
		margin: 0.25rem 0 0;
		color: #777;
		font-size: 0.8rem;
	}

	.users {
		display: grid;
		gap: 3rem;
	}

	.user {
		min-width: 0;
	}

	.user-header {
		margin-bottom: 1rem;
	}

	.login {
		font-weight: 600;
	}

	.muted {
		color: #777;
		font-size: 0.78rem;
	}

	.teams {
		display: grid;
		gap: 1.25rem;
	}

	.team {
		padding: 1rem;
		border: 1px solid #292929;
		border-radius: 0.4rem;
		background: #111;
	}

	.team-header {
		margin-bottom: 1rem;
	}

	.repo {
		display: grid;
		gap: 0.3rem;
		margin-bottom: 1.25rem;
	}

	.repo > span,
	.label {
		color: #666;
		font-size: 0.7rem;
		text-transform: uppercase;
	}

	code {
		overflow-wrap: anywhere;
		color: #aaa;
		font-size: 0.75rem;
	}

	.evaluations {
		display: grid;
		gap: 0.5rem;
	}

	.evaluation {
		border: 1px solid #292929;
		border-radius: 0.35rem;
		background: #0d0d0d;
	}

	.evaluation > summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem;
		cursor: pointer;
		list-style: none;
	}

	.evaluation > summary::-webkit-details-marker {
		display: none;
	}

	.summary-main {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
		width: 100%;
		min-width: 0;
	}

	.evaluation-body {
		display: grid;
		gap: 1.5rem;
		padding: 1rem;
		border-top: 1px solid #222;
	}

	.evaluation-body > div {
		display: grid;
		gap: 0.4rem;
	}

	p {
		margin: 0;
		line-height: 1.55;
	}

	.feedbacks {
		display: grid;
		gap: 0.75rem;
	}

	.feedback {
		padding-left: 0.75rem;
		border-left: 1px solid #333;
	}

	.raw {
		color: #777;
		font-size: 0.75rem;
	}

	.raw summary {
		cursor: pointer;
	}

	pre {
		margin: 0.75rem 0 0;
		padding: 0.75rem;
		overflow: auto;
		background: #090909;
		font-size: 0.72rem;
		line-height: 1.5;
	}

	@media (max-width: 600px) {
		main {
			width: min(100% - 1.25rem, 52rem);
			padding-top: 1rem;
		}

		.page-header {
			margin-bottom: 2rem;
		}

		.users {
			gap: 2rem;
		}

		.team {
			padding: 0.75rem;
		}

		.summary-main {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
