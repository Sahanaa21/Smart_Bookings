const errorHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
