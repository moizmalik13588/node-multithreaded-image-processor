import { Jimp } from "jimp";
import { fileURLToPath } from "node:url";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "normal-output");
const INPUT_DIR = path.join(__dirname, "input-images");
async function processImage(imagePath, filename) {
  const outputSubDirPath = path.join(OUTPUT_DIR, filename.split(".")[0]);
  await mkdir(outputSubDirPath, { recursive: true });
  const image = await Jimp.read(imagePath);
  const tasks = [
    {
      name: "thumbnail",
      operation: async () => {
        const thumbnail = image.clone();
        thumbnail.resize({ w: 150, h: 150 });
        await thumbnail.write(path.join(outputSubDirPath, "thumbnail.jpg"));
      },
    },
    {
      name: "small",
      operation: async () => {
        const small = image.clone();
        small.resize({ w: 300, h: 300 });
        await small.write(path.join(outputSubDirPath, "small.jpg"));
      },
    },
    {
      name: "medium",
      operation: async () => {
        const thumbnail = image.clone();
        thumbnail.resize({ w: 600, h: 600 });
        await thumbnail.write(path.join(outputSubDirPath, "thumbnail.jpg"));
      },
    },
    {
      name: "large",
      operation: async () => {
        const large = image.clone();
        large.resize({ w: 1000, h: 1000 });
        await large.write(path.join(outputSubDirPath, "large.jpg"));
      },
    },
    {
      name: "blur",
      operation: async () => {
        const blur = image.blur(5);
        await blur.write(path.join(outputSubDirPath, "blur.jpg"));
      },
    },
    {
      name: "grayscale",
      operation: async () => {
        const grayscale = image.greyscale();
        await grayscale.write(path.join(outputSubDirPath, "grayscale.jpg"));
      },
    },
  ];
  for (const task of tasks) {
    await task.operation();
  }
}

async function main() {
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|bmp|tiff|gif)$/i.test(file),
  );
  const startTime = Date.now();
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const filePath = path.join(INPUT_DIR, file);
    await processImage(filePath, file);
    console.log(`${file} processed!)`);
  }
  const totalTime = Date.now() - startTime;
  console.log("=".repeat(30));
  console.log("Normal Processing Completed");
  console.log("=".repeat(30));
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(
    `Average Time: ${(totalTime / imageFiles.length / 1000).toFixed(2)} seconds`,
  );

  console.log("=".repeat(30));
}
main();
