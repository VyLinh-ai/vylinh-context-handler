import { TErrorMode } from '../definitions/IError.model';

class MyError extends Error {
  role: TErrorMode;

  info?: any;

  status: number;

  code?: string;
}

export { MyError };
