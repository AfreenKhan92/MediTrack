export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = {};
    Object.values(err.errors).forEach((val) => {
      errors[val.path] = val.message;
    });
    message = 'Validation failed';
  }

  // Handle Mongo Duplicate Key Error (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    errors = { [field]: message };
  }

  // Handle JSON Validation from our validation middleware
  if (message.startsWith('{') && message.endsWith('}')) {
    try {
      errors = JSON.parse(message);
      message = 'Validation failed';
      statusCode = 400;
    } catch (e) {
      // Not JSON, leave as is
    }
  }

  res.status(statusCode);
  res.json({
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
