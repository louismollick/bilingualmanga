import { NextResponse, type NextRequest } from "next/server";

import fs from "fs";

import type { IchiranResponse } from "@/types/ichiran";
import type { MokuroResponse } from "@/types/mokuro";
import {
  safelyWriteFile,
  safelyReadFile,
} from "@/lib/ocr/utils";
import { env } from "@/env.js";

const getSegmentationHealth = async () => {
  try {
    const res = await fetch(`${env.ICHIRAN_URL}/health`);
    if (!res.ok) {
      const reason = await res.text();
      const message = `Error returned from Ichiran /health: ${reason}`
      console.error(message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error returned from Ichiran /health:", error);
    return false;
  }
};

const segmentText = async (line: string) => {
  if (!line) return null;
  try {
    const res = await fetch(`${env.ICHIRAN_URL}/segment/${line}`);
    if (!res.ok) {
      const reason = await res.text();
      const message = `Error returned from Ichiran /segment: ${reason}`;
      console.error(message);
      return null;
    }
    return (await res.json()) as IchiranResponse;
  } catch (error) {
    console.error("Error returned from Ichiran /segment:", error);
    return null;
  }
};

export async function GET(
  request: NextRequest,
  {
    params: { mangaSlug, volumeNumber },
  }: { params: { mangaSlug: string; volumeNumber: string } },
) {
  const dirPath = `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr/volume-${volumeNumber}`;
  const isHealthy = await getSegmentationHealth();
  if (!isHealthy) {
    return NextResponse.json({ message: "Health error occurred" }, { status: 500 });
  }

  const t0 = performance.now();

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
        ocr?.blocks.map(async (block) => {
          const input = block.lines.join("\n");

          if (!forceResegmentation && block.segmentation) {
            console.log(
              "Skipping segmentation for block because it was already done...",
            );
            return block;
          }

          const segmentation = await segmentText(input);
          if (!segmentation) {
            console.error(
              `Error during segmentation of input: "${input}".`,
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

  const time = performance.now() - t0;
  console.log(`Segmentation of directory took ${time} milliseconds.`);

  return NextResponse.json({ message: `Success in ${time} milliseconds` }, { status: 200 });
}
