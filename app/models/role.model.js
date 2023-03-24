const mongoose = require("mongoose");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now, expires: 3600 },
  })
);

module.exports = Role;
