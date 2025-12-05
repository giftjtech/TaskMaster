import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // Don't leak sensitive information in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = Array.isArray(message) ? message.join(', ') : message;
    
    response.status(status).json({
      success: false,
      statusCode: status,
      message: isProduction && status >= 500 
        ? 'An internal server error occurred' 
        : errorMessage,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}

