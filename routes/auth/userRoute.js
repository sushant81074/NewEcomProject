const passport = require("passport");
const {
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
} = require("../../controller/auth/userController");
const {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userAssignRoleValidator,
  userPathVariableValidator,
} = require("../../validator/auth/userValidator");
const { validate } = require("../../model/auth/userModel");
const {
  verifyJwt,
  verifyPermission,
} = require("../../middlewares/authMiddleware");
const { UserRoleEnum } = require("../../constants");

const router = require("express").Router();

router.get("/current-user", verifyJwt, getCurrentUser);

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );
router
  .route("/change-password")
  .post(
    verifyJwt,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router.route("/avatar").patch(verifyJwt, updateUserAvatar);
router.route("/resend-email-verification").post(resendEmailVerification);
router
  .route("/assign-role/:userId")
  .post(
    verifyJwt,
    verifyPermission([UserRoleEnum.ADMIN]),
    userPathVariableValidator(),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

router
  .route("/google")
  .get(
    passport.authenticate("google", { scope: ["profile", "email"] }),
    (req, res) => {
      res.send("redirecting to google.....");
    }
  );

router.route("/github").get(
  passport.authenticate("github", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to github.....    ");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);

router
  .route("/github/callback")
  .get(passport.authenticate("github"), handleSocialLogin);

module.exports = router;
