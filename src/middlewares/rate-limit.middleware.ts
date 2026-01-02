import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => isTest,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => isTest,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
