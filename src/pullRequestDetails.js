module.exports = {
	getPullRequestDetails: async function (logger, octokit, owner, repo, num) {
		const result = await octokit.graphql(
			`
				query pullRequests($owner: String!, $repo: String!, $num: Int!) {
					repository(owner:$owner,name:$repo) {
						pullRequest(number:$num) {
							body,
							lastEditedAt,
							userContentEdits(first:100) {
								nodes {
									editedAt,
									editor {
										login
									},
									diff
								}
							},
							editor {
								login
							}
						}
					}
				}
			`, {
				owner,
				repo,
				num
			}
		);

		logger.debug(JSON.stringify(result));

		return {
			body: result.repository.pullRequest.body,
			edits: result.repository.pullRequest.userContentEdits.nodes
		};
	}
};