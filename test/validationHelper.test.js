let verificationHelper = require('../src/validationHelpers');
const CONSTANTS = require('../src/constants');

describe('validationHelper', () => {
	const logger = { error: jest.fn() };

	describe('storiesAreValidated', () => {
		it('returns true when all stories exist in edits by azure bot', () => {
			const stories = [ 'AB#123', 'AB#124' ];
			const pullRequest = {};
			const edits = stories.map(story => {
				return {
					diff: `[${story}](https://some.link)`,
					editor: {
						login: CONSTANTS.AB_BOT_NAME
					}
				}
			});

			pullRequest.edits = edits;

			expect(verificationHelper.storiesAreVerified(logger, stories, pullRequest)).toEqual(true);
		});

		it('returns false when any story does not exist in edits by azure bot', () => {
			const stories = [ 'AB#123', 'AB#124' ];
			const pullRequest = {};

			pullRequest.edits = [{
				diff: `[${stories[0]}](https://some.link)`,
				editor: {
					login: CONSTANTS.AB_BOT_NAME
				}
			}];

			expect(verificationHelper.storiesAreVerified(logger, stories, pullRequest)).toEqual(false);
		});
	});

	describe('parsePullRequestBody', () => {
	it('returns empty array when no azure board story reference is present', () => {
			const body = 'some pull request text';

			expect(verificationHelper.parsePullRequestBody(body)).toEqual([]);
		});

		it('returns all azure board story references as an array', () => {
			const stories = [ 'AB#123', 'AB#124' ];

			const body = `${stories.join(" ")}`;

			expect(verificationHelper.parsePullRequestBody(body)).toEqual(stories);
		});
	});
});