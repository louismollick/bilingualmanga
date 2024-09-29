"server-only";

import { promises as fs } from "fs";

export default async function safelyWriteOcrFile(
  filePath: string,
  content: string,
) {
  try {
    await fs.writeFile(filePath, content);
    return true;
  } catch (error) {
    console.log(
      `Error during safelyWriteOcrFile for filePath ${filePath}.\nError: ${JSON.stringify(error)}`,
    );
    return false;
  }
}
