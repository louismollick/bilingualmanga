"server-only";

import { promises as fs } from "fs";

export default async function safelyReadDirectory(dirPath: string) {
  try {
    const fileNames = await fs.readdir(dirPath);
    return fileNames;
  } catch (error) {
    console.log(`Error during safelyReadDirectory: ${JSON.stringify(error)}`);
    return null;
  }
}
