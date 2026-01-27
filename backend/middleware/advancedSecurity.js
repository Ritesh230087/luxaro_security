const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../utils/logger');
const crypto = require('crypto');

// ✅ IN-MEMORY STORES
class InMemoryStore {
  constructor() {
    this.hits = new Map();
    this.resetTime = new Map();
    
    // Cleanup every 1 minute
    setInterval(() => this.cleanup(), 60000);
  }

  increment(key) {
    const now = Date.now();
    const current = this.hits.get(key) || { count: 0, resetTime: now + 60000 };
    
    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + 60000;
    } else {
      current.count++;
    }
    
    this.hits.set(key, current);
    return current;
  }

  decrement(key) {
    const current = this.hits.get(key);
    if (current && current.count > 0) {
      current.count--;
      this.hits.set(key, current);
    }
  }

  resetKey(key) {
    this.hits.delete(key);
    this.resetTime.delete(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.hits.entries()) {
      if (now > value.resetTime) {
        this.hits.delete(key);
      }
    }
  }
}

// ✅ JWT BLACKLIST (In-Memory with MongoDB Backup)
class JWTBlacklist {
  constructor() {
    this.blacklist = new Set();
    this.expiryMap = new Map();
    
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async add(jti, expiresIn) {
    this.blacklist.add(jti);
    this.expiryMap.set(jti, Date.now() + (expiresIn * 1000));
    
    // ✅ Persist to MongoDB
    try {
      const BlacklistedToken = require('../models/BlacklistedToken');
      await BlacklistedToken.create({
        jti,
        expiresAt: new Date(Date.now() + (expiresIn * 1000))
      });
    } catch (e) {
      console.warn('Failed to persist blacklist to DB:', e.message);
    }
  }

  isBlacklisted(jti) {
    return this.blacklist.has(jti);
  }

  cleanup() {
    const now = Date.now();
    for (const [jti, expiry] of this.expiryMap.entries()) {
      if (now > expiry) {
        this.blacklist.delete(jti);
        this.expiryMap.delete(jti);
      }
    }
  }

  async loadFromDB() {
    try {
      const BlacklistedToken = require('../models/BlacklistedToken');
      const tokens = await BlacklistedToken.find({ 
        expiresAt: { $gt: new Date() } 
      });
      
      tokens.forEach(token => {
        this.blacklist.add(token.jti);
        this.expiryMap.set(token.jti, token.expiresAt.getTime());
      });
      
      console.log(`✅ Loaded ${tokens.length} blacklisted tokens from DB`);
    } catch (e) {
      console.warn('Could not load blacklist from DB:', e.message);
    }
  }
}

const jwtBlacklist = new JWTBlacklist();
jwtBlacklist.loadFromDB(); // Load on startup

//REGEX DOS PROTECTION
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

//DYNAMIC RATE LIMITER (In-Memory)
const store = new InMemoryStore();

const dynamicRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: (req) => {
    const isAuth = !!req.headers.authorization || !!req.cookies.token;
    return isAuth ? 100 : 20;
  },
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health';
  },
  handler: (req, res) => {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: 60
    });
  },
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userId = req.user?._id || 'anonymous';
    return `${ip}:${userId}`;
  }
});

// ✅ HOST HEADER VALIDATION
const validateHostHeader = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') return next();
  
  const host = req.headers.host;
  const allowedHosts = [
    new URL(process.env.FRONTEND_URL).host,
    'localhost:5000',
    'localhost:5173'
  ];
  
  if (!allowedHosts.includes(host)) {
    logSecurityEvent('INVALID_HOST_HEADER', {
      host,
      ip: req.ip,
      severity: 'CRITICAL'
    });
    return res.status(400).json({ success: false, message: 'Invalid Host Header' });
  }
  next();
};

// ✅ DEEP INPUT SANITIZATION
const advancedInputSanitization = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/\0/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
    }
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.startsWith('__') || 
            key === 'constructor' || key === 'prototype') {
          delete obj[key];
          logSecurityEvent('NOSQL_INJECTION_ATTEMPT', {
            key,
            ip: req.ip,
            path: req.path
          });
          continue;
        }
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// ✅ ENHANCED CSP
const enhancedCSP = (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64')
  req.cspNonce = nonce
  
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://rc-epay.esewa.com.np",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    "report-uri /api/csp-report" 
  ].join('; '))
  
  next()
}


const cacheControl = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  next();
};

// ✅ REQUEST ID
const requestId = (req, res, next) => {
  const crypto = require('crypto');
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// ✅ STRICT TYPE VALIDATION
const strictTypeValidation = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const ct = req.headers['content-type'];
    if (!ct || (!ct.includes('application/json') && !ct.includes('multipart/form-data'))) {
      // Allow but warn in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Missing or invalid Content-Type header');
      }
    }
  }
  next();
};

// ✅ BUSINESS LOGIC VALIDATOR
const businessLogicValidator = (req, res, next) => {
  if (req.body.quantity && (req.body.quantity < 0 || req.body.quantity > 1000)) {
    return res.status(400).json({ success: false, message: 'Invalid quantity' });
  }
  
  if (req.body.price && (req.body.price < 0 || req.body.price > 10000000)) {
    return res.status(400).json({ success: false, message: 'Invalid price' });
  }
  
  next();
};

// ✅ IP RATE LIMITING
const ipRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const trustedIPs = ['127.0.0.1', '::1'];
    return trustedIPs.includes(req.ip);
  }
});

// ✅ INPUT SIZE VALIDATION
const validateInputSizes = (req, res, next) => {
  const limits = {
    name: 100,
    email: 255,
    password: 128,
    phone: 20,
    address: 500,
    description: 5000,
    notes: 1000
  };
  
  const checkSize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && limits[key]) {
        if (obj[key].length > limits[key]) {
          logSecurityEvent('INPUT_SIZE_VIOLATION', {
            field: key,
            size: obj[key].length,
            limit: limits[key],
            ip: req.ip,
            path: req.path
          });
          
          return res.status(400).json({
            success: false,
            message: `Field '${key}' exceeds maximum length of ${limits[key]}`
          });
        }
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkSize(obj[key]);
        if (result) return result;
      }
    }
  };
  
  const violation = checkSize(req.body);
  if (violation) return violation;
  
  next();
};

module.exports = {
  JWTBlacklist: jwtBlacklist,
  escapeRegex,
  dynamicRateLimiter,
  validateHostHeader,
  advancedInputSanitization,
  enhancedCSP,
  cacheControl,
  requestId,
  strictTypeValidation,
  businessLogicValidator,
  ipRateLimiter,
  validateInputSizes
};