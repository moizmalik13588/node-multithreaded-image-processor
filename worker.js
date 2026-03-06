import { parentPort, workerData } from "node:worker_threads";
import { Jimp } from "jimp";
import { fileURLToPath } from "node:url";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "multi-threaded-output");
async function processImage() {
  const { imagePath, filename } = workerData;
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
  parentPort.postMessage({
    sucess: true,
    message: `Finished processing ${filename}`,
  });
}
processImage();
