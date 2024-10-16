import { NextResponse, type NextRequest } from "next/server";

import fs from "fs";
import childProcess from "child_process";

import type { IchiranResponse } from "@/types/ichiran";
import type { MokuroResponse } from "@/types/mokuro";
import {
  safelyWriteFile,
  safelyParseJson,
  safelyReadFile,
} from "@/lib/ocr/utils";

const command = "docker";
const args = ["exec", "-t", "ichiran", "ichiran-cli"];

export async function GET(
  request: NextRequest,
  {
    params: { mangaSlug, volumeNumber },
  }: { params: { mangaSlug: string; volumeNumber: string } },
) {
  const dirPath = `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr/volume-${volumeNumber}`;

  // Verify ichiran-cli is alive and working
  const result = childProcess.spawnSync(command, [...args, "-h"], {
    encoding: "utf8",
  });

  if (result.error || result.stdout.toLowerCase().includes("error")) {
    const message = `ichiran-cli not working as expected".\nError: ${result.error}`;
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }

  // Read each Mokuro OCR .json file in the directory, and for each speech bubble text call ichiran-cli, then save back to .json file
  const fileNames = fs.readdirSync(dirPath);
  const forceResegmentation = request.nextUrl.searchParams.get("force");
  await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = `${dirPath}/${fileName}`;
      console.info(`Reading ${filePath}...`);
      const ocr = await safelyReadFile<MokuroResponse>(filePath);

      if (!ocr) {
        console.error(
          `No OCR found, skipping segmentation for file path: ${filePath}`,
        );
        return;
      }

      console.info(`Starting segmentation for ${filePath}...`);
      ocr.blocks = await Promise.all(
        ocr?.blocks.map((block) => {
          const input = block.lines.join("\n");

          if (!forceResegmentation && block.segmentation) {
            console.log(
              "Skipping segmentation for block because it was already done...",
            );
            return block;
          }

          const result = childProcess.spawnSync(
            command,
            [...args, "-f", input],
            {
              encoding: "utf8",
            },
          );

          if (result.error || result.stderr) {
            console.error(
              `Error during segmentation of input: "${input}".\nError: ${result.error} ${result.stderr}`,
            );
            return block;
          }

          const segmentation = safelyParseJson<IchiranResponse>(result.stdout);

          if (!segmentation) {
            console.error(
              `Error during segmentation parsing for output: "${JSON.stringify(result.stdout)}"`,
            );
            return block;
          }

          block.segmentation = segmentation;

          return block;
        }),
      );

      const writeSuccess = await safelyWriteFile(filePath, JSON.stringify(ocr));
      if (!writeSuccess) {
        console.error(
          `Error while writing to OCR file ${filePath}.\nOutput was: ${JSON.stringify(ocr)}`,
        );
        return;
      }

      console.log(`Done segmenting file ${filePath}!`);
    }),
  );

  return NextResponse.json({ message: "Success!" }, { status: 200 });
}
