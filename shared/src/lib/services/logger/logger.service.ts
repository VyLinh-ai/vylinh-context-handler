import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LoggerCustomService  implements LoggerService {
    log(context: string, message: string, trace?: any) {
        console.log(`[LOG] ${context} - ${new Date().toISOString()}: ${message} ${trace ? JSON.stringify(trace) : ''}`);
    }

    error(context: string, message: string, trace?: any) {
        console.error(`[ERROR] ${context} - ${new Date().toISOString()}: ${message} ${trace ? JSON.stringify(trace) : ''}`);
    }

    warn(context: string, message: string, trace?: any) {
        console.warn(`[WARN] ${context} - ${new Date().toISOString()}}: ${message} ${trace ? JSON.stringify(trace) : ''}`);
    }

    debug(context: string, message: string, trace?: any) {
        console.warn(`[DEBUG] ${context} - ${new Date().toISOString()}: ${message} ${trace ? JSON.stringify(trace) : ''}`);
    }

    verbose(context: string, message: string, trace?: any) {
        console.warn(`[VERBOSE] ${context} - ${new Date().toISOString()}}: ${message} ${trace ? JSON.stringify(trace) : ''}`);
    }
}
