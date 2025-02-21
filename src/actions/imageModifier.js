
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import chalk from "chalk";
import { performance } from "perf_hooks"; // Import performance for time tracking

export async function convertImages(data={}) {
  let {
    inputFolder = "./input",
    outputFolder = "./output",
    outputFormat = "webp",
    inputFormat = ["jpg", "jpeg", "png", "gif"],
    quality = 80,
    copyNonImageFiles = true,
    clearOutputFolder = true,
    maxWidth = undefined,
    maxHeight = undefined,
    maxSize = undefined
  } = data;


  const startTime = performance.now(); // Start timer

  if(maxSize){
    maxWidth = maxSize;
    maxHeight = maxSize;
  }

  outputFormat = outputFormat.toLowerCase();

  try {
    // Ensure the output folder exists
    if(clearOutputFolder){
      await fs.emptyDir(outputFolder);
    }else{
      await fs.ensureDir(outputFolder);
    }

    // Get all images (and non-image files if COPY_NON_IMAGE_FILES is true)
    const allFiles = await getAllFiles(inputFolder);

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
      const relativePath = path.relative(inputFolder, filePath);
      const outputFilePath = path.join(outputFolder, relativePath);

      try {
        const { size: originalSize } = await fs.stat(filePath);
        totalOriginalSize += originalSize;
        
        if (isImageFile(inputFormat,filePath)) {
          const outputImagePath = outputFilePath.replace(path.extname(filePath), `.${outputFormat}`);

          // Ensure the subdirectory exists
          await fs.ensureDir(path.dirname(outputImagePath));

          const imageStartTime = performance.now(); // Start image timer

          const image = sharp(filePath);
          const metadata = await image.metadata();
          
          let resizeOptions = {};

          // Only apply resizing if maxWidth or maxHeight are defined
          if ((maxWidth && metadata.width > maxWidth) || (maxHeight && metadata.height > maxHeight)) {
            resizeOptions = {
              width: maxWidth || null, // If maxWidth is undefined, sharp will ignore it
              height: maxHeight || null, // If maxHeight is undefined, sharp will ignore it
              fit: "inside", // Ensures aspect ratio is maintained
            };
          }

          // Apply resizing only if necessary
          let processedImage = image;
          if (Object.keys(resizeOptions).length > 0) {
            processedImage = processedImage.resize(resizeOptions);
          }

          await processedImage
            .toFormat(outputFormat, { quality: quality })
            .toFile(outputImagePath);


          const { size: newSize } = await fs.stat(outputImagePath);
          totalNewSize += newSize;
          imagesConverted++;

          const imageEndTime = performance.now();
          const imageElapsedTime = ((imageEndTime - imageStartTime) / 1000).toFixed(2);
          const reductionPercentage = originalSize > 0 
            ? ((originalSize - newSize) / originalSize * 100).toFixed(2) 
            : 0;
          
          console.log(
            chalk.green(`✔ ${relativePath} -> ${path.basename(outputImagePath)}`),
            chalk.gray(`(${formatSize(originalSize)} → ${formatSize(newSize)})`),
            chalk.magenta(`🕒 ${imageElapsedTime}s`),
            chalk.yellow(`📉 -${reductionPercentage}%`)
          );

        } else if (copyNonImageFiles) {
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
    const totalReduction = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2) 
      : 0;
    
    console.log("\n" + chalk.cyan("===== Summary ====="));
    console.log(chalk.cyan(`📸 Images converted: ${imagesConverted}`));
    if(copyNonImageFiles) console.log(chalk.cyan(`📂 Non-image files copied: ${filesCopied}`));
    console.log(chalk.cyan(`💾 Previous size: ${formatSize(totalOriginalSize)}`));
    console.log(chalk.cyan(`📁 New size: ${formatSize(totalNewSize)}`));
    console.log(chalk.cyan(`📉 Saved space: ${formatSize(savedSpace)} (-${totalReduction}%)`));
    console.log(chalk.cyan(`⏳ Time elapsed: ${elapsedTime} seconds`));

  } catch (err) {
    console.error(chalk.red("Error reading files:"), err.message);
  }

  process.stdin.setRawMode(false); // Restore terminal mode
  process.exit(0);

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
function isImageFile(inputFormat, file) {
  const ext = path.extname(file).toLowerCase().replace(".", ""); // Get extension without dot
  return inputFormat.map(format => format.toLowerCase()).includes(ext);
}

// Format file sizes
function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

// Run the converter
// convertImages();
