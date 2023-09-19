const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const router = require("./routes/auth/userRoute");

app.use(cookieParser());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.status(200).send({ message: "home page" });
});
app.use("/api/v1/user", router);

module.exports = app;
