export interface User {
  tid: string;
  uid: string;
  usn: string;
  vrs: Record<string, string>;
  addr?: string;
  exp: number;
}

export interface CustomRequest extends Request {
  user: User;
}

export interface DecodedUAToken {
  user_id: string;
  address: string;
  exp: number;
  iat: number;
}
