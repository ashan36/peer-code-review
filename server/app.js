require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const { join } = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { connectDB } = require("./database");
const passport = require("passport");

const indexRouter = require("./routes/index");
const pingRouter = require("./routes/ping");
const userRouter = require("./routes/user");
const reviewRouter = require("./routes/review");
const notificationRouter = require("./routes/notification");

const { json, urlencoded } = express;

var app = express();

connectDB();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, "public")));

require("./config/passport-config")(passport);
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/ping", pingRouter);
app.use(userRouter);
app.use(reviewRouter);
app.use("/notifications", notificationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
