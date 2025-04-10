var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const { con } = require("./db");

const { router: EnT } = require("./routes/EnT");
const { router: HR } = require("./routes/HR");
const { router: Mgmt } = require("./routes/Mgmt");
const { router: Marketing } = require("./routes/Marketing");
const { router: Sales } = require("./routes/Sales");
const { authenticateUser } = require("./middleware/authentication");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (["/", "/login", "/logoutFromEverywhere"].includes(req.path)) {
    return next(); // Skip authentication for these routes
  }
  authenticateUser(req, res, next);
});


app.use("/", EnT);
app.use("/hr", HR);
app.use("/management", Mgmt);
app.use("/marketing", Marketing);
app.use("/sales", Sales);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = 5002;
app.listen(PORT, async () => {
  console.log(`Server started at PORT ${PORT}`);
  await con();
});

module.exports = app;
