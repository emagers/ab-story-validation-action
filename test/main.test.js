const core = require('@actions/core');
const github = require('@actions/github');
const CONSTANTS = require('../src/constants');

jest.mock('@actions/core', () => ({
	__esModule: true,
	...jest.requireActual('@actions/core'),
	setFailed: jest.fn(),
	info: jest.fn().mockImplementation(() => { }),
	getInput: jest.fn(),
	error: jest.fn(),
})).mock('@actions/github', () => ({
	__esModule: true,
	...jest.requireActual('@actions/github'),
	getOctokit: jest.fn(),
	context: {
		payload: {
			pull_request: {
				number: 10
			},
			repository: {
				owner: {
					login: 'emagers'
				},
				name: 'ab-story-validation'
			}
		}
	}
}));

process.env.GITHUB_STEP_SUMMARY = "/dev/null";

describe('ab-story-validation', () => {
	let action;

	afterEach(() => {
		jest.restoreAllMocks();
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
		action = require('../src/main');

		await action(getPullRequestDetails);
		expect(core.info).toHaveBeenCalled();
	});

	it('fails when any AB link is not verified', async () => {
		action = require('../src/main');
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

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});

	it('succeeds when not a pull request', async () => {
		action = require('../src/main');
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "AB#ABC",
			edits: []
		}));
		github.context.payload.pull_request = null;

		await action(getPullRequestDetails);
		expect(core.info).toHaveBeenCalled();
	});

	it('fails when it is a pull request with invalid AB link format', async () => {
		action = require('../src/main');
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "AB#ABC",
			edits: []
		}));

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});

	it('fails when it is a pull request with no AB link', async () => {
		action = require('../src/main');
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "",
			edits: []
		}));

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});
});

