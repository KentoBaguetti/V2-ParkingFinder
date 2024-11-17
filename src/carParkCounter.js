const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const img = "/car parking 2.jpg";

const imageToBase64 = (imgPath) => {
  return fs.readFileSync(imgPath, { encoding: "base64" });
};

const countCars = async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and tell me how many cars you see. Return an integer value only",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64, ${imageToBase64(img)}`,
              },
            },
          ],
        },
      ],
    });

    console.log("Response from OpenAI:", response.choices[0]);
    return res.status(200);
  } catch (error) {
    console.error("Error processing image:", error.message);
  }
};

module.exports = { countCars };
