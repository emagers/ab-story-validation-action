const CONSTANTS = require('./constants');

const storiesAreVerified = function(log, stories, pullRequest) {
	return stories.map(story => storyIsVerified(log, story, pullRequest))
								.every(verified => verified === true);
};

const storyIsVerified = function(log, story, pullRequest) {
	const verified = pullRequest.userContentEdits.some(edit => edit.diff.includes(story) && edit.editor.login === CONSTANTS.AB_BOT_NAME);

	if (!verified) {
		log.error(`${story} was not validated by ${CONSTANTS.AB_BOT_NAME}`);
	}

	return verified;
};

const parsePullRequestBody = function(payload) {
	if (!payload.pull_request) return null;

	let matches = payload.pull_request.body.match(CONSTANTS.AB_LINK_EXPRESSION);
	return matches === null ? [] : matches;
};

module.exports = {
	parsePullRequestBody,
	storiesAreVerified
}