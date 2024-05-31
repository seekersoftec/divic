import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

/**
 * AllExceptionsFilter is a global exception filter that handles all uncaught exceptions
 * in the application, providing a consistent error response format.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Handles exceptions caught by the filter.
   * @param exception - The exception that was thrown.
   * @param host - The current execution context.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType.includes('graphql')) {
      // Check if it's a GraphQL context
      this.handleGqlException(exception, GqlArgumentsHost.create(host));
    } else {
      this.logger.error('Unhandled context type', contextType);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Handles exceptions for HTTP requests.
   * @param exception - The exception that was thrown.
   * @param host - The current HTTP execution context.
   */
  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.formatMessage(message),
    });
  }

  /**
   * Handles exceptions for GraphQL requests.
   * @param exception - The exception that was thrown.
   * @param gqlHost - The current GraphQL execution context.
   */
  private handleGqlException(exception: unknown, gqlHost: GqlArgumentsHost) {
    const { req } = gqlHost.getContext();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error
    // this.logger.error('GraphQL Exception:', exception);
    this.logger.error(`GraphQL Exception: ${exception}`);

    // Throw an ApolloError which is understood by Apollo Server
    throw new ApolloError(this.formatMessage(message), String(status), {
      timestamp: new Date().toISOString(),
      path: req?.url,
    });
  }

  /**
   * Formats the message to ensure it is a string.
   * @param message - The message to format.
   * @returns The formatted message.
   */
  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    if (typeof message === 'object' && message !== null) {
      if (message.message) {
        return typeof message.message === 'string'
          ? message.message
          : JSON.stringify(message.message);
      }
      return JSON.stringify(message);
    }
    return String(message);
  }
}
