// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   NotFoundException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { UserService } from '../../modules/user/user.service';
// import { TokenPayload } from './tokenpayload';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     private configService: ConfigService,
//     private userService: UserService
//   ) {}

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);
//     /**
//          * need access token  
//          *  {
//                 "access_token": "0xf36687530dadd966848957a5e563abded1ea982f",
//             }
//          */
//     try {
//       const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
//         secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
//       });
//       const requester = await this.userService.findByPublicKey(
//         payload.publicKey
//       );
//       if (!requester) {
//         throw new NotFoundException();
//       }
//       request['user'] = requester;
//     } catch {
//       throw new UnauthorizedException();
//     }
//     return true;
//   }
// }
