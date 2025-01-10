import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtInterceptor implements NestInterceptor {
  private readonly signingKey = 'defaultencryptionkey'; // Ensure this matches the Golang signing key

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.signingKey);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  decodeToken(token: string) {
    return jwt.decode(token);
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // if (!token) {
    //   throw new UnauthorizedException('Token is required');
    // }

    try {
      const decoded = this.verifyToken(token);
      request.user = decoded; // Attach decoded token data to request object
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return next.handle();
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }
}
