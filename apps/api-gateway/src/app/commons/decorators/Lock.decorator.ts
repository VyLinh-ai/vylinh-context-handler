// lock.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Lock = (key: string) => SetMetadata('lock:key', key);
