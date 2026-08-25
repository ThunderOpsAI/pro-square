interface RateLimitRecord {
  timestamps: number[];
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60 * 60 * 1000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of stale entries every 10 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 10 * 60 * 1000).unref?.();
    }
  }

  public check(key: string): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.store.get(key) || { timestamps: [] };

    // Filter timestamps within the sliding window
    const recentTimestamps = record.timestamps.filter((ts) => now - ts < this.windowMs);

    if (recentTimestamps.length >= this.maxRequests) {
      const oldest = recentTimestamps[0];
      const reset = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        success: false,
        remaining: 0,
        reset: Math.max(reset, 1),
      };
    }

    recentTimestamps.push(now);
    this.store.set(key, { timestamps: recentTimestamps });

    return {
      success: true,
      remaining: this.maxRequests - recentTimestamps.length,
      reset: Math.ceil(this.windowMs / 1000),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      const active = record.timestamps.filter((ts) => now - ts < this.windowMs);
      if (active.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: active });
      }
    }
  }
}

// Global singleton rate limiter for quote submissions (5 quotes per IP per hour)
const globalRateLimiter = globalThis as unknown as {
  quoteRateLimiter?: InMemoryRateLimiter;
};

export const quoteRateLimiter =
  globalRateLimiter.quoteRateLimiter ?? new InMemoryRateLimiter(60 * 60 * 1000, 5);

if (process.env.NODE_ENV !== 'production') {
  globalRateLimiter.quoteRateLimiter = quoteRateLimiter;
}
