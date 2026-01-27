const path = require('path');

exports.preventPathTraversal = (req, res, next) => {
  if (req.body && req.body.path) {
    const normalizedPath = path.normalize(req.body.path);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }
    req.body.path = normalizedPath;
  }
  if (req.query && req.query.path) {
    const normalizedPath = path.normalize(req.query.path);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }
    req.query.path = normalizedPath;
  }

  next();
};
