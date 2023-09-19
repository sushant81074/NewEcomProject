import passport, { deserializeUser } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { userModel as User } from "../model/auth/userModel";
import { UserLoginType, UserRoleEnum } from "../constants";
import { ApiError } from "../utils/ApiError";

try {
  passport.serializeUser((user, next) => {
    next(null, user?._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (user) next(null, user);
      else next(new ApiError(404, "user not found"), null);
    } catch (error) {
      next(
        new ApiError(500, "something went wrong while deserializing user"),
        null
      );
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRETKEY,
        callbackURL: "/auth/google/callback",
      },
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
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          const user = await User.create({
            email: profile._json.email,
            password: profile._json.sub,
            username: profile._json?.email.split("@")[0],
            isEmailVerified: true,
            role: UserRoleEnum.USER,
            avatar: {
              url: profile._json.picture,
              localPath: "",
            },
            loginType: UserLoginType.GOOGLE,
          });
          if (user) next(null, user);
          else
            next(
              new ApiError(
                500,
                "something went wrong while registering the user"
              ),
              null
            );
        }
      }
    )
  );

  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRETKEY,
        callbackURL: "/auth/github/callback",
      },
      async (_, __, profile, next) => {
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          if (user.loginType !== UserLoginType.GITHUB) {
            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          const user = await User.create({
            email: profile._json.email,
            password: profile._json.sub,
            username: profile._json?.email.split("@")[0],
            isEmailVerified: true,
            role: UserRoleEnum.USER,
            avatar: {
              url: profile._json.picture,
              localPath: "",
            },
            loginType: UserLoginType.GITHUB,
          });
          if (user) next(null, user);
          else
            next(
              new ApiError(500, "something went wrong while registering user"),
              null
            );
        }
      }
    )
  );
} catch (error) {
  console.log("passport error : ", error);
}
