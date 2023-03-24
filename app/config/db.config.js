require("dotenv").config();

module.exports = {
  HOST: process.env.host,
  PORT: process.env.port,
  DB: process.env.db_name,
};
