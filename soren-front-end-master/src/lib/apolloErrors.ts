import { ApolloError } from '@apollo/client';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function getApolloErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  if (error instanceof ApolloError) {
    if (error.graphQLErrors.length) {
      return error.graphQLErrors.map((item) => item.message).join(', ');
    }

    if (error.networkError?.message) {
      return error.networkError.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
