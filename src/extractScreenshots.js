const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Function to extract screenshots from a video every 30 seconds
function extractScreenshots(videoPath, outputDir, interval) {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get the video duration to calculate timemarks
  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('Error fetching video metadata:', err.message);
      return;
    }

    const duration = metadata.format.duration; // Video duration in seconds
    const timemarks = generateTimemarks(duration, interval);

    console.log(`Video duration: ${duration} seconds`);
    console.log(`Timemarks: ${timemarks.join(', ')}`);

    // Run FFmpeg to take screenshots
    ffmpeg(videoPath)
      .on('start', (commandLine) => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`);
      })
      .on('error', (err) => {
        console.error(`Error processing video: ${err.message}`);
      })
      .on('end', () => {
        console.log('Screenshots have been extracted successfully!');
      })
      .screenshots({
        timestamps: timemarks,
        folder: outputDir,
        filename: 'screenshot-at-%s-seconds.png', // Custom naming format
      });
  });
}

// Utility function to generate timemarks
function generateTimemarks(duration, interval) {
  const timemarks = [];
  for (let time = 0; time < duration; time += interval) {
    timemarks.push(time.toFixed(2)); // Push time as a string with 2 decimals
  }
  return timemarks;
}

// Example usage
const videoPath = 'video.mp4'; // Replace with your video path
const outputDir = path.join('./screenshots'); // Replace with your output directory
const interval = 30; // Interval in seconds

extractScreenshots(videoPath, outputDir, interval);
