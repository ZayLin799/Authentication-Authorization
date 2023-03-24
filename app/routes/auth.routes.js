const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");

const adminController = require("../controllers/admin_auth.controller");
const userController = require("../controllers/user_auth.controller");
const { user } = require("../models");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //admin routes
  app.post(
    "/api/auth/admin/signup",
    [
      verifySignUp.checkDuplicateAdminNameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    adminController.signup
  );
  app.post("/api/auth/admin/signin", adminController.signin);
  app.post("/api/auth/admin/verify_otp", adminController.verify_otp);

  //user routes
  app.post(
    "/api/auth/user/signup",
    [
      verifySignUp.checkDuplicateUserNameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    userController.signup
  );
  app.post("/api/auth/user/signin", userController.signin);
  app.post("/api/auth/user/verify_otp", userController.verify_otp);

  app.get("/users", [authJwt.verifyToken, authJwt.isUser], (req, res) => {
    const userId = req.userId;
    res.status(200).send({
      msg: "Reach!",
      id: userId,
    });
  });
};
