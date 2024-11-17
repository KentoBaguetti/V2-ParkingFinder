const dotenv = require("dotenv");
dotenv.config();
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const imageToBase64 = (imgPath) => {
  return fs.readFileSync(imgPath, { encoding: "base64" });
};

const generateTimemarks = (duration, interval) => {
  const timemarks = [];
  for (let time = 0; time < duration; time += interval) {
    timemarks.push(time.toFixed(2));
  }
  return timemarks;
};

const countCarsInImage = async (imagePath) => {
  try {
    const base64ImgUrl = imageToBase64(imagePath);
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
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
                url: `data:image/jpeg;base64,${base64ImgUrl}`,
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
        console.log(`Deleted image file: ${imagePath}`);
      }
    });

    console.log("Response from OpenAI:", response.choices[0]);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error processing image:", error.message);
    return null;
  }
};

const countCars = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const carCount = await countCarsInImage(imagePath);
    return res.status(200).json({ reply: carCount });
  } catch (error) {
    console.error("Error processing image:", error.message);
    return res.status(500).json({ error: "Failed to count cars in image" });
  }
};

function extractScreenshots(videoPath, outputDir, interval) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error("Error fetching video metadata:", err.message);
      return;
    }

    const duration = metadata.format.duration;
    const timemarks = generateTimemarks(duration, interval);

    console.log(`Video duration: ${duration} seconds`);
    console.log(`Timemarks: ${timemarks.join(", ")}`);

    const generatedFilenames = [];

    ffmpeg(videoPath)
      .on("start", (commandLine) => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`);
      })
      .on("filenames", (filenames) => {
        console.log("Will generate screenshots:", filenames);
        generatedFilenames.push(
          ...filenames.map((filename) => path.join(outputDir, filename))
        );
      })
      .on("error", (err) => {
        console.error(`Error processing video: ${err.message}`);
      })
      .on("end", async () => {
        console.log("Screenshots have been extracted successfully!");
        for (const imagePath of generatedFilenames) {
          const carCount = await countCarsInImage(imagePath);
          console.log(`Image ${imagePath} has ${carCount} cars`);
        }
      })
      .screenshots({
        timestamps: timemarks,
        folder: outputDir,
        filename: "screenshot-%s.png",
      });
  });
}

const videoPath = "src/video.mp4";
const outputDir = path.join("./screenshots");
const interval = 10;

extractScreenshots(videoPath, outputDir, interval);
