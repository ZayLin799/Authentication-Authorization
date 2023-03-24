const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.role = require("./role.model");
db.admin = require("./admin.model");
db.admin_otp = require("./admin_otp.model");
db.user = require("./user.model");
db.user_otp = require("./user_otp.model");
db.ROLES = ["admin", "user"];

module.exports = db;
