import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import path from "node:path";
import { readdir } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "normal-output");
const INPUT_DIR = path.join(__dirname, "input-images");
const WORKER_FILE_PATH = path.join(__dirname, "worker.js");
function runWorker(filePath, filename) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_FILE_PATH, {
      workerData: { imagePath: filePath, filename },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
async function main() {
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|bmp|tiff|gif)$/i.test(file),
  );
  const startTime = Date.now();
  // THIS IS PROBLEMATIC => 100 FILES => 100 WORKERS => WORKER POOL
  const imagePromises = imageFiles.map(async (file) => {
    const filePath = path.join(INPUT_DIR, file);
    const data = await runWorker(filePath, file);
    return data;
  });
  await Promise.all(imagePromises);
  await Promise.all(imagePromises);
  const totalTime = Date.now() - startTime;
  console.log("=".repeat(30));
  console.log("Multi Threaded Processing Completed");
  console.log("=".repeat(30));
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(
    `Average Time: ${(totalTime / imageFiles.length / 1000).toFixed(2)} seconds`,
  );

  console.log("=".repeat(30));
}
main();
