import ApiError from "./APIErrorResponse.js";
const errorHandler = (err, req, res, next) => {
  console.log(`Error handler called`);
  console.error(err);
  const stack = err.stack;
  const statusCode = err.code || err.statusCode || 500;
  const message = err.message || "Something went wrong!!!";
  const errors = err.errors || [];
  res.status(statusCode).json(new ApiError(statusCode, message, errors, stack));
};

export default errorHandler;
