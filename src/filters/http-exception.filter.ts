import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * AllExceptionsFilter is a global exception filter that handles all uncaught exceptions
 * in the application, providing a consistent error response format.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Handles exceptions caught by the filter.
   * @param exception - The exception that was thrown.
   * @param host - The current execution context.
   */
  catch(exception: unknown, host: ArgumentsHost) {
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
      message,
    });
  }
}
