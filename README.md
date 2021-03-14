# ab-story-validation-action
An action to validate that pull requests are commented with a valid link to an Azure Boards story

## Usage

In order for this action to validate that the Azure Board story link exists and is valid, the repository must be integrated with the Azure Boards bot. The action will parse the pull request body and find all Azure Board story references in the format of `AB#\<[\d]+\>` and then call GitHubs GraphQL API to retrieve all of the pull requests events, and match all of the `AB#` references to an edit made the Azure Board bot. 

It's recommended that you trigger this action on `[ opened, edited, reopened ]`. See [workflow triggers](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) for more information. 

In order to make the GraphQL call, the action must have access to a GITHUB_TOKEN which allows for API calls. See [GitHub's documentation](https://docs.github.com/en/actions/reference/encrypted-secrets#using-encrypted-secrets-in-a-workflow) for more information on how to pass environment variables into actions.
