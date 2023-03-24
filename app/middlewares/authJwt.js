const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const Admin = db.admin;
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  Admin.findById(req.userId).exec((err, admin) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (admin) {
      next();
      return;
    } else {
      return res.status(401).send({ message: "Authorized only for admin!" });
    }

    // Role.find(
    //   {
    //     _id: { $in: admin.roles },
    //   },
    //   (err, roles) => {
    //     if (err) {
    //       res.status(500).send({ message: err });
    //       return;
    //     }

    //     for (let i = 0; i < roles.length; i++) {
    //       if (roles[i].name === "admin") {
    //         next();
    //         return;
    //       }
    //     }

    //     res.status(403).send({ message: "Require Admin Role!" });
    //     return;
    //   }
    // );
  });
};

isUser = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      next();
      return;
    } else {
      return res.status(401).send({ message: "Authorized only for user!" });
    }
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
};
module.exports = authJwt;
