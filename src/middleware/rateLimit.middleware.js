// Simple in-memory rate limit (chatbot jaise public endpoint ke liye)
const rateLimit = ({ windowMs = 60 * 1000, max = 20 } = {}) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, v] of hits) if (v.reset <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || entry.reset <= now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message: 'Bahut zyada requests, thodi der baad try karo' });
    }
    next();
  };
};

module.exports = rateLimit;