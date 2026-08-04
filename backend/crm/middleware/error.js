const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message || 'Unknown error'}`);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Supabase/PostgREST specific errors gracefully
  if (err.code && typeof err.code === 'string' && err.code.startsWith('23')) {
    status = 400; // Constraint violation
    message = 'A database constraint was violated.';
  }

  res.status(status).json({
    success: false,
    message: message,
    // Only include details/stack in development
    ...(process.env.NODE_ENV === 'development' && {
      details: err,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
