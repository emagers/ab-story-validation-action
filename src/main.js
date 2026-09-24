import * as core from '@actions/core';
import * as github from '@actions/github';
import { getPullRequestDetails } from './pullRequestDetails.js';
import { parsePullRequestBody, verifyStories } from './validationHelpers.js';

async function run(getPRDetails=getPullRequestDetails) {
	const token = core.getInput('GITHUB_TOKEN');
	const context = github.context ?? {};
	const pull_request = context.payload?.pull_request;

	if (!pull_request) {
		core.info('Change is not a pull request, skipping validation');
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
		await core.summary
			.addHeading("AB Story Verification")
			.addRaw('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.')
			.write();

		core.setFailed('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.');
		return;
	}

	const verifications = verifyStories(core, stories, prDetails);

	const data = [[{data: 'AB Story', heading: true }, {data: 'Verified', heading: true}]];
	verifications.forEach(v => data.push([v.story, v.verification ? '✅' : '❌']));

	await core.summary
		.addHeading("AB Story Verification Status")
		.addTable(data)
		.write();

	if (verifications.some(verification => verification.verified === false)) {
		core.setFailed('Some referenced stories could not be linked');
		return;
	}

	core.info('Azure Board link exists');
}

export default run;