const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

const { countCarsInImage } = require("./src/carParkCounter.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/sendImage", upload.single("image"), countCarsInImage);

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
