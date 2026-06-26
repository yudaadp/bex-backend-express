function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || "Too many requests, please try again later";
  const hits = new Map();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = `${req.ip}:${req.method}:${req.baseUrl}${req.path}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      res.set("X-RateLimit-Limit", String(max));
      res.set("X-RateLimit-Remaining", String(max - 1));
      return next();
    }

    current.count += 1;
    const remaining = Math.max(max - current.count, 0);
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);

    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(remaining));
    res.set("Retry-After", String(retryAfter));

    if (current.count > max) {
      return res.status(429).json({ message });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter
};
