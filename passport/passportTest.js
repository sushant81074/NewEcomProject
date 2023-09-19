import passport from "passport";
import { Strategy as Google } from "passport-google-oauth20";
import { Strategy as Github } from "passport-github2";
import { userModel as User } from "../model/auth/userModel";
import { ApiError } from "../utils/ApiError";
import { UserLoginType, UserRoleEnum } from "../constants";

try {
  passport.serializeUser((user, next) => {
    next(null, user?._id);
  });
  passport.deserializeUser(async (id, next) => {
    const user = await User.findById(id);
    if (user) next(null, user);
    else next(new ApiError(404, "user not found"));
  });

  passport.use(
    new Google({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRETKEY,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }),
    async (_, __, profile, next) => {
      // Check if the user with email already exist
      // if user exists, check if user has registered with the GOOGLE SSO
      // If user is registered with some other method, we will ask him/her to use the same method as registered.
      // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend
      // If user is registered with the same login method we will send the saved user
      // If user with email does not exists, means the user is coming for the first time
      // There is a check for traditional logic so the password does not matter in this login method

      const user = await User.findOne({ email: profile._json.email });
      if (user) {
        if (user.loginType !== UserLoginType.GOOGLE) {
          next(
            new ApiError(
              400,
              "user not found with this google sso try some other method"
            ),
            null
          );
        } else {
          next(null, user);
        }
      } else {
        const newUser = await User.create({
          email: profile._json.email,
          password: profile._json.sub,
          username: profile._json.email.split("@")[0],
          isEmailVerified: true,
          role: UserRoleEnum.USER,
          avatar: {
            url: "",
            localPath: "",
          },
          loginType: UserLoginType.GOOGLE,
        });
        if (newUser) next(null, newUser);
        else
          next(
            new ApiError(500, "something went wrong while registering user")
          );
      }
    }
  );

  passport.use(
    new Github({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRETKEY,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    }),
    async (_, __, profile, next) => {
      // Check if the user with email already exist
      // if user exists, check if user has registered with the GOOGLE SSO
      // If user is registered with some other method, we will ask him/her to use the same method as registered.
      // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend
      // If user is registered with the same login method we will send the saved user
      // If user with email does not exists, means the user is coming for the first time
      // There is a check for traditional logic so the password does not matter in this login method
      const user = await User.findOne({ email: profile._json.email });
      if (user) {
        if (user.loginType !== UserLoginType.GITHUB) {
          next(
            new ApiError(
              404,
              "user not found if you have any other method of login pleease try it"
            )
          );
        } else {
          next(null, user);
        }
      } else {
        const newUser = await User.create({
          email: profile._json.email,
          password: profile._json.sub,
          username: profile._json.email.split("@")[0],
          avatar: {
            url: "",
            localPath: "",
          },
          loginType: UserLoginType.GITHUB,
        });
        if (user) next(null, newUser);
        else
          next(
            new ApiError(
              500,
              "something went wrong during registering the user "
            ),
            null
          );
      }
    }
  );
} catch (error) {
  throw new ApiError(500, {
    message: `something went wrong while deserializing user `,
    errorMessage: error.message,
    error: error,
  });
}
