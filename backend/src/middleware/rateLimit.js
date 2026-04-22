const requests = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const times = requests.get(key).filter((t) => now - t < windowMs);

    if (times.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((times[0] + windowMs - now) / 1000),
      });
    }

    times.push(now);
    requests.set(key, times);

    if (Math.random() < 0.01) {
      for (const [k, v] of requests.entries()) {
        if (!v.length) requests.delete(k);
      }
    }

    next();
  };
};

module.exports = rateLimit;
