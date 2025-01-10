class RequestTimeError extends Error {
  name = 'RequestTimeError';

  message: string;

  code = 'REQUEST_TIMEOUT_ERROR';

  status = 503;

  role = 1; // Return msg error to client

  constructor(message?: string) {
    super();
    this.message = message
      ? 'Request timeout! ' + message
      : 'Request timeout! ';
  }
}

export { RequestTimeError };
