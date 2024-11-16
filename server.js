const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

const { countCars } = require("./src/gptController.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/getCarCount", countCars);

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
