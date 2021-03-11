const { Toolkit } = require('actions-toolkit');
const { parsePullRequestBody, storiesAreVerified } = require('./validationHelpers');

// Run your GitHub Action!
Toolkit.run(async tools => {
	tools.log.debug(JSON.stringify(tools.context.payload));

	const stories = parsePullRequestBody(tools.context.payload);

	if (stories === null) {
		tools.exit.success('Change is not a pull request, skipping validation');
		return;
	}

	if (stories.length === 0) {
		tools.log.error('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.');
		tools.exit.failure();
		return;
	}

	if (!storiesAreVerified(tools.log, stories, tools.context.payload.pull_request)) {
		tools.log.error('Some referenced stories could not be linked');
		tools.exit.failure();
		return;
	}

	tools.exit.success('Azure Board link exists');
});

