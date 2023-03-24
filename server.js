const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./app/routes/auth.routes")(app);

const db = require("./app/models");
const dbConfig = require("./app/config/db.config.js");
const Role = db.role;
db.mongoose.set("strictQuery", false);

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

async function initial() {
  const query = Role.find({ name: "admin" });
  const count = await query.estimatedDocumentCount();
  if (count === 0) {
    new Role({
      name: "admin",
    }).save();
    new Role({
      name: "user",
    }).save();
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

app.listen(8080, () => {
  console.log(`Server is running on port 8080.`);
});
