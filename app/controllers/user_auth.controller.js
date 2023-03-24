const config = require("../config/auth.config");
const helper = require("../helper/helper");
const db = require("../models");
const User = db.user;
const Role = db.role;
const User_Otp = db.user_otp;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "name, email, password: all required" });
  }
  const user = new User({
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 8),
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "email, password: all required" });
  }

  User.findOne({
    email: email,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!user) {
      return res.status(404).send({ message: "Email Not found." });
    }
    var passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }
    const otp_code = helper.generateOTP();
    const user_otp = new User_Otp({
      user_id: user._id,
      otp: otp_code,
    });
    user_otp.save((err, user_otp) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user_otp) {
        setTimeout(async () => {
          await User_Otp.findByIdAndDelete(user_otp._id);
        }, 60000);
      }
    });
    return res
      .status(200)
      .send({ message: "OTP sent", opt: otp_code, user_id: user._id });
  });
};

exports.verify_otp = (req, res) => {
  const { user_id, otp } = req.body;
  if (!user_id || !otp) {
    return res.status(400).json({ msg: "user, otp: all required" });
  }

  User_Otp.findOne({
    user_id: user_id,
  }).exec((err, user_otp) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!user_otp) {
      return res.status(401).send({ message: "OTP expired" });
    }
    const checkOtp = user_otp.otp == otp;
    if (checkOtp) {
      User.findOne({ _id: user_id }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        var token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400,
        });
        setTimeout(async () => {
          await User_Otp.findByIdAndDelete(user_otp._id);
        }, 500);
        res.status(200).send({
          id: user._id,
          name: user.name,
          email: user.email,
          accessToken: token,
        });
      });
    }
    if (!checkOtp) {
      return res.status(401).send({ message: "OTP don't match" });
    }
  });
};
