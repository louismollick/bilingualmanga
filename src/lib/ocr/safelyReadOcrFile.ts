"server-only";

import { promises as fs } from "fs";
import type { MokuroResponse } from "@/types/mokuro";

export default async function safelyReadOcrFile(filePath: string) {
  try {
    const ocrFile = await fs.readFile(filePath, "utf8");
    return JSON.parse(ocrFile) as MokuroResponse;
  } catch (error) {
    console.log(`Error during safelyReadOcrFile: ${JSON.stringify(error)}`);
    return null;
  }
}
