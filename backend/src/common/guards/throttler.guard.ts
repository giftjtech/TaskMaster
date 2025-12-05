import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address for tracking
    return req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
  }
}

