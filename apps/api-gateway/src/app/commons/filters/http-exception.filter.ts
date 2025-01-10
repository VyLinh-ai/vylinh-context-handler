import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ParametersError } from '../errors/ParameterError.error';
import OtherError from '../errors/OtherError.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (
      exception instanceof ParametersError ||
      exception instanceof OtherError
    ) {
      status = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Log the exception details
    this.logger.error({
      message: exception.message || 'Internal Server Error',
      exception: exception.stack, // Log the stack trace for more details
    });

    // Prepare the error response
    let errorResponse: any;
    if (exception instanceof ParametersError) {
      errorResponse = {
        statusCode: status,
        message: exception.message,
        error: exception.code,
        errors: exception.info,
        role: exception.role,
      };
    } else if (exception instanceof OtherError) {
      errorResponse = {
        statusCode: status,
        message: exception.message,
        error: exception.code,
        role: exception.role,
      };
    } else if (exception instanceof BadRequestException) {
      const responseContent = exception.getResponse();
      // Format BadRequestException specifically for class-validator errors
      errorResponse = {
        statusCode: status,
        message: responseContent['message'],
        // errors: responseContent['message'],
      };
    } else {
      errorResponse = {
        statusCode: status,
        message: exception.message || 'Internal Server Error',
      };
    }

    // Send the error response
    response.status(status).json(errorResponse);
  }
}
