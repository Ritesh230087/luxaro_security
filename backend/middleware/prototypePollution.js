exports.preventPrototypePollution = (req, res, next) => {
  if (!Object.isFrozen(Object.prototype)) {
    Object.freeze(Object.prototype);
  }

  if (req.body) {
    delete req.body.__proto__;
    delete req.body.constructor;
    delete req.body.prototype;
  }

  if (req.query) {
    delete req.query.__proto__;
    delete req.query.constructor;
    delete req.query.prototype;
  }

  if (req.params) {
    delete req.params.__proto__;
    delete req.params.constructor;
    delete req.params.prototype;
  }

  next();
};

