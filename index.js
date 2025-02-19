const INPUT_FOLDER = "./input";  // Folder with original images
const OUTPUT_FOLDER = "./output"; // Folder where converted images will be saved
const OUTPUT_FORMAT = "webp"; // Default format (changeable)
const QUALITY = 80; // Image quality (0-100)


import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import chalk from "chalk";
import { performance } from "perf_hooks"; // Import performance for time tracking

async function convertImages() {
  const startTime = performance.now(); // Start timer

  try {
    // Ensure the output folder exists
    await fs.ensureDir(OUTPUT_FOLDER);

    const files = await fs.readdir(INPUT_FOLDER);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    if (imageFiles.length === 0) {
      console.log(chalk.yellow("No images found in input folder."));
      return;
    }

    let totalOriginalSize = 0;
    let totalNewSize = 0;

    console.log(chalk.blue(`Processing ${imageFiles.length} images...\n`));

    for (const file of imageFiles) {
      const imageStartTime = performance.now(); // Start image timer

      const inputPath = path.join(INPUT_FOLDER, file);
      const outputFileName = `${path.parse(file).name}.${OUTPUT_FORMAT}`;
      const outputPath = path.join(OUTPUT_FOLDER, outputFileName);

      try {
        const { size: originalSize } = await fs.stat(inputPath);
        totalOriginalSize += originalSize;

        await sharp(inputPath)
          .toFormat(OUTPUT_FORMAT, { quality: QUALITY })
          .toFile(outputPath);

        const { size: newSize } = await fs.stat(outputPath);
        totalNewSize += newSize;

        const imageEndTime = performance.now(); // End image timer
        const imageElapsedTime = ((imageEndTime - imageStartTime) / 1000).toFixed(2); // Convert to seconds

        console.log(
          chalk.green(`✔ ${file} -> ${outputFileName}`),
          chalk.gray(`(${formatSize(originalSize)} → ${formatSize(newSize)})`),
          chalk.magenta(`🕒 ${imageElapsedTime}s`)
        );
      } catch (err) {
        console.error(chalk.red(`Error processing ${file}:`), err.message);
      }
    }

    const savedSpace = totalOriginalSize - totalNewSize;
    const endTime = performance.now(); // End timer
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // Convert to seconds

    console.log("\n" + chalk.cyan("===== Summary ====="));
    console.log(chalk.cyan(`📸 Images converted: ${imageFiles.length}`));
    console.log(chalk.cyan(`📂 Space saved: ${formatSize(savedSpace)}`));
    console.log(chalk.cyan(`⏳ Time elapsed: ${elapsedTime} seconds`));

  } catch (err) {
    console.error(chalk.red("Error reading files:"), err.message);
  }
}

// Helper function to format file sizes
function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// Run the converter
convertImages();
