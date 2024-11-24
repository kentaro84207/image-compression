import * as fs from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";
import { glob } from "glob";
import * as path from "path";

const execAsync = promisify(exec);

// 対応する画像拡張子
const SUPPORTED_EXTENSIONS = ["png", "jpeg", "jpg", "webp"];

// 画像圧縮関数
async function compressImage(inputPath: string, outputPath: string): Promise<void> {
  try {
    const command = `ffmpeg -i "${inputPath}" -compression_level 9 "${outputPath}"`;
    console.log(`Compressing: ${inputPath} -> ${outputPath}`);
    await execAsync(command);
  } catch (error) {
    console.error(`Failed to compress image: ${inputPath}`, error);
  }
}

// メイン処理
async function compressImagesInFolder(folderPath: string): Promise<void> {
  try {
    const files = glob.sync(`${folderPath}/**/*.{${SUPPORTED_EXTENSIONS.join(",")}}`);
    if (files.length === 0) {
      console.log("No images found to compress.");
      return;
    }

    console.log(`Found ${files.length} images. Starting compression...`);

    // 出力用ディレクトリを準備
    const compressedDir = path.join(folderPath, "compressed");
    await fs.ensureDir(compressedDir);

    for (const file of files) {
      const fileName = path.basename(file);
      const outputPath = path.join(compressedDir, fileName);
      await compressImage(file, outputPath);
    }

    console.log("Image compression completed. Compressed files are in the 'compressed' folder.");
  } catch (error) {
    console.error("Error during image compression:", error);
  }
}

// 実行部分
async function main() {
  // コマンドライン引数でフォルダパスを取得
  const folderPath = process.argv[2];

  if (!folderPath) {
    console.error("Please specify a folder path as an argument.");
    console.error("Usage: ts-node compress-images.ts <folder-path>");
    process.exit(1);
  }

  if (!(await fs.pathExists(folderPath))) {
    console.error(`The specified folder does not exist: ${folderPath}`);
    process.exit(1);
  }

  await compressImagesInFolder(folderPath);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
});
