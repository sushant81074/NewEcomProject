const UserRoleEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

const AvailableUserRoles = Object.values(UserRoleEnum);

const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};
const AvailableUserSocialLogin = Object.values(UserLoginType);

const CouponTypesEnum = {
  FLAT: "FLAT",
};
const AvailableCouponTypes = Object.values(CouponTypesEnum);

const OrderStatusEnum = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "DELIVERED",
};
const AvailableOrderStatuses = Object.values(OrderStatusEnum);

const PaymentProviderEnum = {
  UNKNOWN: "UNKNOWN",
  RAZORPAY: "RAZORPAY",
  PAYPAL: "PAYPAL",
};
const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

module.exports = {
  UserRoleEnum,
  AvailableUserRoles,
  UserLoginType,
  AvailableUserSocialLogin,
  USER_TEMPORARY_TOKEN_EXPIRY,
  CouponTypesEnum,
  AvailableCouponTypes,
  OrderStatusEnum,
  AvailableOrderStatuses,
  PaymentProviderEnum,
  AvailablePaymentProviders,
};
