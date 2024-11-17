const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const imageToBase64 = (imgPath) => {
  return fs.readFileSync(imgPath, { encoding: "base64" });
};

const countCars = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const base64ImgUrl = imageToBase64(imagePath);
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
                url: `data:image/jpeg;base64, ${base64ImgUrl}`,
              },
            },
          ],
        },
      ],
    });
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(`Failed to delete file at ${imagePath}:`, err);
      } else {
      }
    });

    console.log("Response from OpenAI:", response.choices[0]);
    return res.status(200).json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error processing image:", error.message);
  }
};

module.exports = { countCars };
