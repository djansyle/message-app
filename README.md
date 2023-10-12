# Message Application with GraphQL

Welcome to the Message Application, an easy-to-use platform showcasing the power of GraphQL in building a messaging app. Whether you're new to GraphQL or a seasoned developer, this application will provide insights into creating a basic messaging system.

## Getting Started

To get started with the Message Application, follow the steps outlined below to run and explore its features.

### Prerequisites

Before you begin, ensure that the following dependencies are installed on your system:

- [Docker](https://www.docker.com/): Required to run the MongoDB container.
- [Node.js](https://nodejs.org/): Necessary for installing the required Node.js packages.

### Running the Tests

To run the application's tests, execute the following command:

```bash
docker-compose up -d mongo && npm install && npm test
```

If the tests fail due to a timeout error, it's likely that MongoDB hasn't fully started on your end. In such cases, please wait for MongoDB to be up and running, and then re-run `npm install && npm test`.

This command not only starts a MongoDB container but also installs the essential Node.js packages and executes the tests.

### Running the Application

To launch the application, enter the following command:

```bash
docker-compose up -d
```

This command initiates the application in detached mode, allowing you to work seamlessly.

Once the application is up and running, open your web browser and navigate to:

[http://localhost:8000/graphql](http://localhost:8000/graphql)

Now you can start exploring the GraphQL API and delve into the messaging functionality.