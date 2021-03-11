const { Toolkit } = require('actions-toolkit');
const CONSTANTS = require('../src/constants');

describe('ab-story-validation', () => {
	let action, tools

	// Mock Toolkit.run to define `action` so we can call it
	Toolkit.run = jest.fn((actionFn) => { action = actionFn })
	// Load up our entrypoint file
	require('../src')

	beforeEach(() => {
		// Create a new Toolkit instance
		tools = new Toolkit()
		// Mock methods on it!
		tools.exit.success = jest.fn();
		tools.exit.failure = jest.fn();
	});

	it('succeeds when AB link is present', () => {
		const story = 'AB#123';
		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.body = story;

		tools.context.payload.pull_request.userContentEdits = [{
			diff: `[${story}](https://some.link)`,
			editor: {
				login: CONSTANTS.AB_BOT_NAME
			}
		}];

		action(tools);
		expect(tools.exit.success).toHaveBeenCalled();
	});

	it('fails when any AB link is not verified', () => {
		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.body = 'AB#123 AB#142';

		tools.context.payload.pull_request.userContentEdits = [{
			diff: '[AB#123](https://some.link)',
			editor: {
				login: CONSTANTS.AB_BOT_NAME
			}
		}];

		action(tools);
		expect(tools.exit.failure).toHaveBeenCalled();
	});

	it('succeeds when not a pull request', () => {
		tools.context.payload.pull_request = null;

		action(tools);
		expect(tools.exit.success).toHaveBeenCalled();
	});

	it('fails when it is a pull request with invalid AB link format', () => {
		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.body = "AB#ABC";

		action(tools);
		expect(tools.exit.failure).toHaveBeenCalled();
	});

	it('fails when it is a pull request with no AB link', () => {
		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.body = "";

		action(tools);
		expect(tools.exit.failure).toHaveBeenCalled();
	});
});

