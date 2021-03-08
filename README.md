# ab-story-validation-action
An action to validate that pull requests are commented with a link to an Azure Boards story

## Usage

This Action validates that there is a comment in the pull request body in the format of AB#\<story number\>. If no story is linked, the Action will fail.