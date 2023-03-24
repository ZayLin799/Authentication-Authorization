const config = require("../config/auth.config");
const helper = require("../helper/helper");
const db = require("../models");
const Admin = db.admin;
const Role = db.role;
const Admin_Otp = db.admin_otp;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "name, email, password: all required" });
  }
  const admin = new Admin({
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 8),
  });
  admin.save((err, admin) => {
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
          admin.roles = roles.map((role) => role._id);
          admin.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "Admin was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "admin" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        admin.roles = [role._id];
        admin.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: "Admin was registered successfully!" });
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

  Admin.findOne({
    email: email,
  }).exec((err, admin) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!admin) {
      return res.status(404).send({ message: "Email Not found." });
    }
    var passwordIsValid = bcrypt.compareSync(password, admin.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }
    const otp_code = helper.generateOTP();
    const admin_otp = new Admin_Otp({
      admin_id: admin._id,
      otp: otp_code,
    });
    admin_otp.save((err, admin_otp) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (admin_otp) {
        setTimeout(async () => {
          await Admin_Otp.findByIdAndDelete(admin_otp._id);
        }, 60000);
      }
    });
    return res
      .status(200)
      .send({ message: "OTP sent", opt: otp_code, admin_id: admin._id });
  });
};

exports.verify_otp = (req, res) => {
  const { admin_id, otp } = req.body;
  if (!admin_id || !otp) {
    return res.status(400).json({ msg: "admin, otp: all required" });
  }

  Admin_Otp.findOne({
    admin_id: admin_id,
  }).exec((err, admin_otp) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!admin_otp) {
      return res.status(401).send({ message: "OTP expired" });
    }
    const checkOtp = admin_otp.otp == otp;
    if (checkOtp) {
      Admin.findOne({ _id: admin_id }).exec((err, admin) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        var token = jwt.sign({ id: admin.id }, config.secret, {
          expiresIn: 86400,
        });
        setTimeout(async () => {
          await Admin_Otp.findByIdAndDelete(admin_otp._id);
        }, 500);
        res.status(200).send({
          id: admin._id,
          name: admin.name,
          email: admin.email,
          accessToken: token,
        });
      });
    }
    if (!checkOtp) {
      return res.status(401).send({ message: "OTP don't match" });
    }
  });
};
