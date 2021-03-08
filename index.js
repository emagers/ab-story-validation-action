const { Toolkit } = require('actions-toolkit')

const linkExpression = /AB\#(\d)+/g

// Run your GitHub Action!
Toolkit.run(async tools => {
	if (tools.context.payload.pull_request && tools.context.payload.pull_request.body.match(linkExpression)) {
		tools.exit.success('Azure Board link exists');
	} else if (!tools.context.payload.pull_request) {
		tools.exit.success('Change is not a pull request, skipping validation');
	} else {
		tools.log.error('No Azure Board link found in pull request. Please update the Pull Request with a link in the format of AB#<story number>.');
		tools.exit.failure();
	}
});
