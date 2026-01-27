exports.preventHPP = (req, res, next) => {
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = req.query[key][0];
    }
  }

  for (const key in req.body) {
    if (Array.isArray(req.body[key]) && key !== 'items' && key !== 'images') {
      req.body[key] = req.body[key][0];
    }
  }

  next();
};