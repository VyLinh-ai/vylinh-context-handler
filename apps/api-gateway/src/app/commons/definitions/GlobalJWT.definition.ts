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

export interface ECDSASignature {
  r: string;
  s: string;
  msg: string;
}
export interface DecodedUAToken {
  user_id: string;
  wallet: string;
  signature: ECDSASignature;
  exp: number;
  iat: number;
}
