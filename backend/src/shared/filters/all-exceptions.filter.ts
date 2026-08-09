import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        message = (response as any).message || exception.message;
        errors = (response as any).errors || null;
      } else {
        message = exception.message;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const error = exception as any;
      // Handle Prisma Error Codes
      if (error.code) {
        switch (error.code) {
          case 'P2002':
            httpStatus = HttpStatus.CONFLICT;
            message = `Unique constraint failed on field(s): ${(error.meta?.target as string[])?.join(', ') || 'unknown'}`;
            break;
          case 'P2025':
            httpStatus = HttpStatus.NOT_FOUND;
            message = error.meta?.cause || 'Record not found';
            break;
          case 'P2003':
            httpStatus = HttpStatus.BAD_REQUEST;
            message = 'Foreign key constraint failed';
            break;
          default:
            httpStatus = HttpStatus.BAD_REQUEST;
            message = error.message || 'Database error occurred';
            break;
        }
      } else if (error.message) {
        message = error.message;
      }
    }

    this.logger.error(
      `Exception thrown: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
      ...(errors ? { errors } : {}),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
