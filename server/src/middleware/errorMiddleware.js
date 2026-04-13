// Global Error Handling Middleware
// Prevents server crashes and leaks of sensitive info
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  if (process.env.NODE_ENV !== 'test') {
      console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
