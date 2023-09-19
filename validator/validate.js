import { validationResult } from "express-validator";
// import { errorHandler } from "../middlewares/errorMiddleware";
import { ApiError } from "../utils/ApiError";

export const validate = (req, res, next) => {
  const error = validationResult(req);
  if (error.isEmpty()) return next();

  const extractedErrors = [];
  error.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(422, "recived data is not valid", extractedErrors);
};
