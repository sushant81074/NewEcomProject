import expressAsyncHandler from "express-async-handler";
import User from "../../model/auth/userModel";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserLoginType, UserRoleEnum } from "../../constants";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendMial,
} from "../../utils/Mail";

const generateAccessAndRefreshToken = async (userId) => {
  // find the user
  // generate accesstoken and refreshtoken
  // save user with refreshtoken
  // return accesstoken and refreshtoken
  // catch errors if any
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while creating accessToken and refreshToken"
    );
  }
};

const userRegister = expressAsyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) throw new ApiError(409, "user already exists");

  const user = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
    role: role || UserRoleEnum.USER,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMial({
    email: user?.email,
    subject: "please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering user");

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { user: createdUser },
        "user registered successfully and verification email has been sent on your email."
      )
    );
});

const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password)
    throw new ApiError(400, "all fields are required for user login");

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) throw new ApiError(404, "user not found or doesn't exists ");

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD)
    throw new ApiError(
      400,
      "You have previously registered using " +
        user.loginType?.toLowerCase() +
        ". Please use the " +
        user.loginType?.toLowerCase() +
        " login option to access your account."
    );

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid)
    throw new ApiError(401, "invalid password  or user credintials");

  const { accessToken, refreshToken } =
    await user.generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .send(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user successfully logged in"
      )
    );
});

const logoutUser = expressAsyncHandler(async (req, res) => {
  // find the user with id and update its refresh token to null
  // make options to http true and secure to production
  // return the status and response
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .send(new ApiResponse(200, {}, "user logged out successfully"));
});

const getCurrentUser = expressAsyncHandler(async (req, res) => {
  return res
    .status(200)
    .send(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const changeCurrentPassword = expressAsyncHandler(async (req, res) => {
  // get oldpassword and newpassword from req.body
  // find user if exists or else throw error
  // compare and verify oldpassword
  // if verified then update password with newpassword
  // send response for password updation successful
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.params?._id);
  if (!user) throw new ApiError(404, "user not found or doesn't exists");

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) throw new ApiError(400, "invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .send(new ApiResponse(201, {}, "password updated successfully"));
});

const assignRole = expressAsyncHandler(async (req, res) => {
  // get user role and id from body and params respectively
  // find the user if exists or else throw apierror
  // update user role and save it
  //  return resposne successful
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "user not found or doesn't exists");

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return req
    .status(201)
    .send(
      new ApiResponse(
        201,
        { updatedRole: user.role },
        "user role updated successfully"
      )
    );
});

const handleSocialLogin = expressAsyncHandler(async (req, res) => {
  // find user with id if have any or else throw error
  // generate access and refresh tokens from generateAccessAndRefreshToken method
  // create options object with httponly to secure and node environment to production
  // return response with accesstoken and refreshtoken as cookie and with options then redirect

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "user not found or doesn't exists");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(301)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

const forgotPasswordRequest = expressAsyncHandler(async (req, res) => {
  // get email from req.boy
  // find user by email if not throw error
  // get unhashed hashed and token expiry form gettemporarytoken method of user
  // set user's forgotpasswordtoken to hashedtoken and forgotpasswordexpiry to tokenexpiry
  // save user
  // send email using sendemail method
  // return response
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "user not found or doesn't exists");

  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMial({
    email: user?.email,
    subject: "password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        "password reset mail has been sent to your mail id"
      )
    );
});

const resetForgottenPassword = expressAsyncHandler(async (req, res) => {
  //  get reset token form params and new password form body
  // create a hashedtoken using crypto
  // find user and simultaneously validte it using hasedtoken to forgotpassword token and forgottokenexpiry to date.now
  // if not user then throw error of invalid token
  // set user forgotpasswordtoken and fogotpasswordexpiry to undefined and save user
  //  set user password to new password and send success response
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(489, "usernot found or doesn't exists");

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .send(new ApiResponse(200, {}, "password reset successful"));
});

const verifyEmail = expressAsyncHandler(async (req, res) => {
  // get verificationtoken from params if not throw error
  // create hashedtoken with crypto
  // find user with emailverification token and emailverificationexpiry and verify with hashedtoken and date.now() respectively
  // if user not found throw error for token invalid or expiry
  // make null to emailverificationtoken and emailverificaitonexpiry and emailverified to true and save the user
  // return response for emailverification successful
  const { verificationToken } = req.params;

  const hashedToken = await crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(489, "token is invalid or has been expired");

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .send(new ApiResponse(200, { isEmailVerified: true }, "email is verified"));
});

const resendEmailVerification = expressAsyncHandler(async (req, res) => {
  // find user or else throw error if not found
  // check if email is verified if it is , throw error of email already verified
  // else create unhased hashed and token expiry from generatetemporarytoken method of user
  // assign emailverificationtoken and emailverificationexpiry to hashedtoken and tokenexpiry and save user
  // send email for user eamilverification
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "user not found or doesn't exists");

  if (user.isEmailVerified)
    throw new ApiError(409, "email is already verified");

  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMial({
    email: user?.email,
    subject: "please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        {},
        "verification email has been sent to your email "
      )
    );
});

const refreshAccessToken = expressAsyncHandler(async (req, res) => {});

module.exports = {
  userRegister,
  loginUser,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  assignRole,
  handleSocialLogin,
  forgotPasswordRequest,
  resetForgottenPassword,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  updateUserAvatar,
};
