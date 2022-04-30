const { Toolkit } = require('actions-toolkit');
const { getPullRequestDetails } = require('./src/pullRequestDetails');
const { parsePullRequestBody, storiesAreVerified } = require('./src/validationHelpers');

// Run your GitHub Action!
Toolkit.run(async (tools, getPRDetails=getPullRequestDetails) => {
	if (!tools.context.payload.pull_request) {
		tools.exit.success('Change is not a pull request, skipping validation');
		return;
	}

	const prDetails = await getPRDetails(
		tools.github,
		tools.context.payload.repository.owner.login,
		tools.context.payload.repository.name,
		tools.context.payload.pull_request.number
	);

	const stories = parsePullRequestBody(prDetails.body);

	if (stories.length === 0) {
		tools.log.error('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.');
		tools.exit.failure();
		return;
	}

	if (!storiesAreVerified(tools.log, stories, prDetails)) {
		tools.log.error('Some referenced stories could not be linked');
		tools.exit.failure();
		return;
	}

	tools.exit.success('Azure Board link exists');
}, {
  secrets: ['GITHUB_TOKEN']
});

