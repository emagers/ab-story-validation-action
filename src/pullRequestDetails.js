module.exports = {
	getPullRequestDetails: async function (octokit, owner, repo, num) {
		const { pullRequests } = await octokit.graphql(
			`
				query pullRequests($owner: String!, $repo: String!, $num: Int) {
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
			`,
			{
				owner: owner,
				repo: repo,
				num: num,
				headers: {
					authorization: `token ${apiKey}`,
				},
			}
		);

		return {
			body: pullRequests.data.repository.pullRequest.body,
			edits: pullRequests.data.repository.pullRequest.userContentEdits
		};
	}
};