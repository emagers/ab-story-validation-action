const { Toolkit } = require('actions-toolkit');
const CONSTANTS = require('../src/constants');

describe('ab-story-validation', () => {
	let action, tools;
	const OWNER = 'emagers';
	const NAME = 'ab-story-validation';
	const NUMBER = '10';

	// Mock Toolkit.run to define `action` so we can call it
	Toolkit.run = jest.fn(async (actionFn) => { action = actionFn })
	// Load up our entrypoint file
	require('../src/index');

	beforeEach(() => {
		tools = new Toolkit()
		// Mock methods on it!
		tools.exit.success = jest.fn();
		tools.exit.failure = jest.fn();

		tools.github = {};
		tools.github.graphql = jest.fn();

		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.number = NUMBER;
		tools.context.payload.repository = {};
		tools.context.payload.repository.owner = {};
		tools.context.payload.repository.owner.login = OWNER;
		tools.context.payload.repository.name = NAME;
	});

	it('succeeds when AB link is present', async () => {
		const story = 'AB#123';

		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve(
			{
				body: story,
				edits: [{
					diff: `[${story}](https://some.link)`,
					editor: {
						login: CONSTANTS.AB_BOT_NAME
					}
				}]
			}
		));

		await action(tools, getPullRequestDetails);
		expect(tools.exit.success).toHaveBeenCalled();
	});

	it('fails when any AB link is not verified', async () => {
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: 'AB#123 AB#142',
			edits: [{
				diff: '[AB#123](https://some.link)',
				editor: {
					login: CONSTANTS.AB_BOT_NAME
				}
			}]
		}));

		await action(tools, getPullRequestDetails);

		expect(tools.exit.failure).toHaveBeenCalledTimes(1);
	});

	it('succeeds when not a pull request', () => {
		tools.context.payload.pull_request = null;

		action(tools);
		expect(tools.exit.success).toHaveBeenCalled();
	});

	it('fails when it is a pull request with invalid AB link format', async () => {
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "AB#ABC",
			edits: []
		}));

		await action(tools, getPullRequestDetails);
		expect(tools.exit.failure).toHaveBeenCalled();
	});

	it('fails when it is a pull request with no AB link', async () => {
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "",
			edits: []
		}));

		await action(tools, getPullRequestDetails);
		expect(tools.exit.failure).toHaveBeenCalled();
	});
});

