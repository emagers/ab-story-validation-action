import { jest } from '@jest/globals';
import CONSTANTS from '../src/constants.js';

process.env.GITHUB_STEP_SUMMARY = "/dev/null";

const core = {
	...(await import('@actions/core')),
	setFailed: jest.fn(),
	info: jest.fn().mockImplementation(() => { }),
	getInput: jest.fn(),
	error: jest.fn(),
};

const github = {
	...(await import('@actions/github')),
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
};

jest.unstable_mockModule('@actions/core', () => core);
jest.unstable_mockModule('@actions/github', () => github);

const action = (await import('../src/main.js')).default;

describe('ab-story-validation', () => {
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
		await action(getPullRequestDetails);
		expect(core.info).toHaveBeenCalled();
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

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});

	it('succeeds when not a pull request', async () => {
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
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "AB#ABC",
			edits: []
		}));

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});

	it('fails when it is a pull request with no AB link', async () => {
		let getPullRequestDetails = jest.fn();
		getPullRequestDetails.mockReturnValue(Promise.resolve({
			body: "",
			edits: []
		}));

		await action(getPullRequestDetails);
		expect(core.setFailed).toHaveBeenCalled();
	});
});

