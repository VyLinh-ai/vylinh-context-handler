export default class ServiceError extends Error {
  name = 'ServiceError';

  message: string;

  code = 'SERVICE_ERROR';

  role = 1; // Return msg error to client

  stack?: string = '';

  status = 500;

  constructor(stack?: string) {
    super();
    this.message = 'Service not available! ';
    this.stack = stack
      ? `${this.code}
    ${stack}`
      : this.message;
  }
}
