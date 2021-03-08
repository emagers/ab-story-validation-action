const { Toolkit } = require('actions-toolkit')

describe('ab-story-validation', () => {
  let action, tools

  // Mock Toolkit.run to define `action` so we can call it
  Toolkit.run = jest.fn((actionFn) => { action = actionFn })
  // Load up our entrypoint file
  require('.')

  beforeEach(() => {
    // Create a new Toolkit instance
    tools = new Toolkit()
    // Mock methods on it!
    tools.exit.success = jest.fn();
		tools.exit.failure = jest.fn();
  });

	it('succeeds when AB link is present', () => {
		tools.context.payload.pull_request = {};
		tools.context.payload.pull_request.body = "AB#123";

		action(tools);
		expect(tools.exit.success).toHaveBeenCalled();
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
})
