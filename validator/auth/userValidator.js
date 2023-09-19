const { body, param } = require("express-validator");
const { AvailableUserRoles } = require("../../constants");

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLowercase()
      .withMessage("username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("username must have atleast more than 3 characters"),
    body("password").trim().isEmpty().withMessage("passowrd is required"),
    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("invalid user role"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("email is invalid"),
    body("username").optional(),
    body("password").notEmpty().withMessage("password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").isEmpty().withMessage("new password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),
  ];
};

const userResetForgottenPasswordValidator = () => {
  return [
    body("newPassword").isEmpty().withMessage("new password is required"),
  ];
};

const userAssignRoleValidator = () => {
  return [
    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("user role is invalid"),
  ];
};

const userPathVariableValidator = () => {
  return [
    param("userId").notEmpty().isMongoId().withMessage("invalid user id"),
  ];
};

module.exports = {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userAssignRoleValidator,
  userPathVariableValidator,
};
