import { GraphQLError } from 'graphql';

export class ServerError extends GraphQLError {
  constructor() {
    super('Server error', {
      extensions: {
        code: 'SERVER_ERROR',
      },
    });
  }
}

export class UnauthorizedError extends GraphQLError {
  constructor() {
    super('Unauthorized', {
      extensions: {
        code: 'UNAUTHORIZED',
      },
    });
  }
}

export class UserAlreadyExistsError extends GraphQLError {
  constructor() {
    super('User already exists', {
      extensions: {
        code: 'USER_ALREADY_EXISTS',
      },
    });
  }
}

export class InvalidEmailAddressFormatError extends GraphQLError {
  constructor() {
    super('Invalid email address format', {
      extensions: {
        code: 'INVALID_EMAIL_ADDRESS_FORMAT',
      },
    });
  }
}

export class UserNotFoundError extends GraphQLError {
  constructor() {
    super('User not found', {
      extensions: {
        code: 'USER_NOT_FOUND',
      },
    });
  }
}

export class InvalidCredentials extends GraphQLError {
  constructor() {
    super('Invalid credentials', {
      extensions: {
        code: 'INVALID_CREDENTIALS',
      },
    });
  }
}
