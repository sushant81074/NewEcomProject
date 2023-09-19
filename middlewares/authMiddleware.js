import { expressAsyncHandler } from "express-async-handler";
import { ApiError } from "../utils/ApiError";
import { jsonwebtoken as Jwt, verify } from "jsonwebtoken";

const verifyJwt = expressAsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "unauthorized request");

  try {
    const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!user) throw new ApiError(401, "invalid access token");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

const getLoggedInUserOrIgnore = expressAsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization").replace("Bearer ", "");

  try {
    const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    req.user = user;
    next();
  } catch (error) {
    next();
  }
});

const verifyPermission = (roles = []) => {
  expressAsyncHandler(async (req, res, next) => {
    if (!req.user?._id) throw new ApiError(401, "unauthorized request");
    if (roles.includes(req.user?.role)) next();
    else throw new ApiError(403, " you aren't allow to perform this action");
  });
};

module.exports = {
  verifyPermission,
  verifyJwt,
  getLoggedInUserOrIgnore,
};
