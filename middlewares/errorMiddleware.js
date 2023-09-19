const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const removeUnusedMutlerImageFilesOnError = require("../utils/Mail");

const errorHandler = (err, req, res, next) => {
  let error = err;
  // check if the error is instance of an ApiError class which extends native Error class
  if (error instanceof ApiError) {
    // if not create a new ApiError instance to keep the consistency , assign an appropriate statusCode, and assign appropriate error message
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "something went wrong ";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }
  //  now we are sure that the error is instance of ApiError class
  //  we create a response and send it
  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV = "development" ? { stack: error.stack } : {}),
  };
  removeUnusedMutlerImageFilesOnError(req);
  return res.status(error.statusCode).send(response);
};

module.exports = { errorHandler };
