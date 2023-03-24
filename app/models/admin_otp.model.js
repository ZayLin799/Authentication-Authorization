const mongoose = require("mongoose");

const Admin_Otp = mongoose.model(
  "Admin_Otp",
  new mongoose.Schema({
    admin_id: String,
    otp: String,
    createdAt: { type: Date, default: Date.now },
  })
);

module.exports = Admin_Otp;
