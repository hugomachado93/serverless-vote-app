# Serverless vote

# Functionality of the application

This application will allow creating/removing/updating/fetching vote items. Each vote item can optionally have an attachment image. Each user only has access to vote items that he/she has created.

# vote items

The application should store vote items, and each vote item contains the following fields:

* `voteId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a vote item (e.g. "Change a light bulb")
* `dueDate` (string) - date and time by which an item should be completed
* `done` (boolean) - true if an item was completed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a vote item
* `voteYesCount` (number) - a number to count the amount of yes votes
* `voteNoCount` (number) - a number to count the amount of no votes
* `endDate` (string) - date and time when a vote should end

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless vote application.