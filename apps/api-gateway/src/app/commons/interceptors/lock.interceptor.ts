// // lock.interceptor.ts
// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable, throwError } from 'rxjs';
// import { catchError, finalize } from 'rxjs/operators';
// import SecureCommon from '../Secure.common';
// import OtherError from '../errors/OtherError.error';
// import { EErrorCode } from '../enums/Error.enum';

// @Injectable()
// export class LockInterceptor implements NestInterceptor {
//   async intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Promise<Observable<any>> {
//     const request = context.switchToHttp().getRequest();
//     const usr = request.user.id;
//     const key = this.getLockKey(context);
//     if (!key) {
//       return next.handle(); // No locking if key is not specified
//     }

//     const lockAcquired = await this.acquireLock(`${key}:${usr}`);
//     console.log('locked: ', lockAcquired);
//     if (!lockAcquired) {
//       throw new OtherError({
//         errorInfo: {
//           code: EErrorCode.REQUEST_RATE_ERROR,
//           message: 'Too many request received at one time',
//         },
//       });
//     }

//     return next.handle().pipe(
//       catchError((error) => {
//         return throwError(() => error);
//       }),
//       finalize(async () => {
//         console.log(`${key}:${usr}`);
//         // await this.releaseLock(`${key}:${usr}`);
//       }),
//     );
//   }

//   private async acquireLock(key: string): Promise<boolean> {
//     const lockKey = `lockkey:${key}`;
//     const lockedSession = await SecureCommon.getSessionInfo(lockKey);
//     if (lockedSession) {
//       return false;
//     } else {
//       await SecureCommon.storeObjectSession(lockKey, 1, 1); // 3 seconds TTL
//       // Attempt to set a lock by using storeObjectSession
//       return true;
//     }
//   }

//   private async releaseLock(key: string): Promise<void> {
//     const lockKey = `lockkey:${key}`;
//     await SecureCommon.deleteSessionInfo(lockKey);
//   }

//   private getLockKey(context: ExecutionContext): string | null {
//     const handler = context.getHandler();
//     return Reflect.getMetadata('lock:key', handler);
//   }
// }
