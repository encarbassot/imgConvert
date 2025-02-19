const INPUT_FOLDER = "./input";  // Folder with original images
const OUTPUT_FOLDER = "./output"; // Folder where converted images will be saved
const OUTPUT_FORMAT = "webp"; // Default format (changeable)
const QUALITY = 80; // Image quality (0-100)
const COPY_NON_IMAGE_FILES = true; // If true, non-image files are copied to output
const CLEAR_OUTPUT_FOLDER = true

import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import chalk from "chalk";
import { performance } from "perf_hooks"; // Import performance for time tracking

async function convertImages() {
  const startTime = performance.now(); // Start timer

  try {
    // Ensure the output folder exists
    if(CLEAR_OUTPUT_FOLDER){
      await fs.emptyDir(OUTPUT_FOLDER);
    }else{
      await fs.ensureDir(OUTPUT_FOLDER);
    }

    // Get all images (and non-image files if COPY_NON_IMAGE_FILES is true)
    const allFiles = await getAllFiles(INPUT_FOLDER);

    if (allFiles.length === 0) {
      console.log(chalk.yellow("No images found in input folder."));
      return;
    }

    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let imagesConverted = 0;
    let filesCopied = 0;

    console.log(chalk.blue(`Processing ${allFiles.length} files...\n`));

    for (const filePath of allFiles) {
      const relativePath = path.relative(INPUT_FOLDER, filePath);
      const outputFilePath = path.join(OUTPUT_FOLDER, relativePath);

      try {
        const stats = await fs.stat(filePath);
        totalOriginalSize += stats.size;

        if (isImageFile(filePath)) {
          const outputImagePath = outputFilePath.replace(path.extname(filePath), `.${OUTPUT_FORMAT}`);

          // Ensure the subdirectory exists
          await fs.ensureDir(path.dirname(outputImagePath));

          const imageStartTime = performance.now(); // Start image timer

          await sharp(filePath)
            .toFormat(OUTPUT_FORMAT, { quality: QUALITY })
            .toFile(outputImagePath);

          const { size: newSize } = await fs.stat(outputImagePath);
          totalNewSize += newSize;
          imagesConverted++;

          const imageEndTime = performance.now();
          const imageElapsedTime = ((imageEndTime - imageStartTime) / 1000).toFixed(2);

          console.log(
            chalk.green(`✔ ${relativePath} -> ${path.basename(outputImagePath)}`),
            chalk.gray(`(${formatSize(stats.size)} → ${formatSize(newSize)})`),
            chalk.magenta(`🕒 ${imageElapsedTime}s`)
          );

        } else if (COPY_NON_IMAGE_FILES) {
          // Copy non-image files if enabled
          await fs.ensureDir(path.dirname(outputFilePath));
          await fs.copy(filePath, outputFilePath);
          filesCopied++;

          console.log(chalk.yellow(`📄 Copied non-image file: ${relativePath}`));
        }

      } catch (err) {
        console.error(chalk.red(`Error processing ${relativePath}:`), err.message);
      }
    }

    const savedSpace = totalOriginalSize - totalNewSize;
    const endTime = performance.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + chalk.cyan("===== Summary ====="));
    console.log(chalk.cyan(`📸 Images converted: ${imagesConverted}`));
    console.log(chalk.cyan(`📂 Non-image files copied: ${filesCopied}`));
    console.log(chalk.cyan(`📂 Space saved: ${formatSize(savedSpace)}`));
    console.log(chalk.cyan(`⏳ Time elapsed: ${elapsedTime} seconds`));

  } catch (err) {
    console.error(chalk.red("Error reading files:"), err.message);
  }
}

// Recursively gets all files in a directory
async function getAllFiles(directory) {
  let files = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if the file is an image
function isImageFile(file) {
  return /\.(jpg|jpeg|png|gif)$/i.test(file);
}

// Format file sizes
function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// Run the converter
convertImages();
