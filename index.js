const core = require('@actions/core');
const github = require('@actions/github');
const { getPullRequestDetails } = require('./src/pullRequestDetails');
const { parsePullRequestBody, storiesAreVerified } = require('./src/validationHelpers');

// Run your GitHub Action!
async function run(getPRDetails=getPullRequestDetails) {
	const token = core.getInput('GITHUB_TOKEN');
	const { context = {} } = github;
	const { pull_request } = context.payload;

	core.info(JSON.stringify(context));

	if (!pull_request) {
		core.success('Change is not a pull request, skipping validation');
		return;
	}

	const prDetails = await getPRDetails(
		github.getOctokit(token),
		context.payload.repository.owner.login,
		context.payload.repository.name,
		pull_request.number
	);

	const stories = parsePullRequestBody(prDetails.body);

	if (stories.length === 0) {
		core.setFailed('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.');
		return;
	}

	if (!storiesAreVerified(core, stories, prDetails)) {
		core.setFailed('Some referenced stories could not be linked');
		return;
	}

	core.success('Azure Board link exists');
}

run();