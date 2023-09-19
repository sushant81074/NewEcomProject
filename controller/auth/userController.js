const asyncHandler = require("express-async-handler");
const User = require("../../model/auth/userModel");
const { ApiError } = require("../../utils/ApiError");
const { UserRoleEnum, UserLoginType } = require("../../constants");

const generateAccessAndRefreshToken = asyncHandler(async (req, res) => {});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const userExist = await User.findOne({ $or: [{ username }, { email }] });
  if (userExist) return res.status(409).send("User already exists");

  const newUser = await User.create({
    username,
    email,
    password,
    isEmailVerified: false,
    role: role || UserRoleEnum.USER,
  });

  if (!newUser)
    return res
      .status(500)
      .send("something went wrong , user register unsuccessful");

  return res.status(201).send({
    message: "new User created",
    user: newUser,
    status: "success",
    statusCode: 201,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email && !password)
    return res.status(400).send("email and username are mendetory");

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) return res.status(404).send("user not found or not exist");
  if (user.loginType != UserLoginType.EMAIL_PASSWORD)
    return res
      .status(400)
      .send(
        "you've previously registerd using " +
          user.loginType?.toLowerCase() +
          " please use " +
          user.loginType?.toLocaleLowerCase() +
          " login option to access your account"
      );

  const isPasswordValid = await user.ispasswordCorrect(password);
  if (!isPasswordValid)
    return res.status(400).send("wrong or invalid password");

  return res
    .status(200)
    .send({ message: "login successful", status: "success", statusCode: 200 });
});

const logoutUser = asyncHandler(async (req, res) => {
  const userLogout = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );

  if (!userLogout) return res.status(500).send("userlogout unsuccessful");

  return res.status(201).send({
    message: "userlogout successful",
    status: userLogout,
    statusCode: 201,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).send({
    message: "current user fetched successfully",
    user: req.user,
    status: "success",
    statusCode: 200,
  });
});

const assignRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).send("user doesn't exist");

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res.status(200).send({
    message: "user role successfully updated",
    role: user.role,
    status: "success",
    statusCode: 201,
  });
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.params;
  if (!oldPassword || !newPassword)
    return res
      .status(400)
      .send("all fields are mandatory for password updation");

  const user = await User.findById(id);
  if (!user) return res.status(404).send("user not found");

  const isPasswordValid = await user.ispasswordCorrect(oldPassword);
  if (!isPasswordValid) return res.status(400).send("invalid password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(201).send({
    message: "password updated successful",
    new_password: user.password,
    status: "success",
    statusCode: 201,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken)
    return res.status(400).send("verification token is missing");

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(489).send("token has expired or invalid");

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .send({ message: "email is verified", isEmailVerified: true });
});

const handleSocialLogin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return res.status(404).send("user not found ");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

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

const forgotPasswordRequest = asyncHandler(async (req, res) => {});
const refreshAccessToken = asyncHandler(async (req, res) => {});
const resendEmailVerification = asyncHandler(async (req, res) => {});
const resetForgottenPassword = asyncHandler(async (req, res) => {});
const updateUserAvatar = asyncHandler(async (req, res) => {});

module.exports = {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
};
