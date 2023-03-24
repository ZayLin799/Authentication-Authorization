const db = require("../models");
const Admin = db.admin;
const User = db.user;
const ROLES = db.ROLES;

checkDuplicateAdminNameOrEmail = (req, res, next) => {
  Admin.findOne({
    name: req.body.name,
  }).exec((err, admin) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (admin) {
      res.status(400).send({ message: "Failed! name is already in use!" });
      return;
    }
    Admin.findOne({
      email: req.body.email,
    }).exec((err, admin) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (admin) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }
      next();
    });
  });
};

checkDuplicateUserNameOrEmail = (req, res, next) => {
  User.findOne({
    name: req.body.name,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      res.status(400).send({ message: "Failed! name is already in use!" });
      return;
    }
    User.findOne({
      email: req.body.email,
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }
      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateAdminNameOrEmail,
  checkDuplicateUserNameOrEmail,
  checkRolesExisted,
};

module.exports = verifySignUp;
