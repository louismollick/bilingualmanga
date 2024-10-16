"server-only";

import { promises as fs } from "fs";
import { type MokuroResponse } from "@/types/mokuro";
import { VOLUME_PREFIX } from "@/lib/filepath/utils";
import {
  getMangaOcrDir,
  getPageOcrPath,
  MANGA_SLUGS_DIR,
} from "@/lib/filepath/server-only-utils";

export function isNotHiddenFile(fileName: string) {
  return fileName !== ".DS_Store";
}

export function getPageOcr(
  mangaSlug: string,
  volumeNumber: string,
  pageNumber: string,
) {
  return safelyReadFile<MokuroResponse>(
    getPageOcrPath(mangaSlug, volumeNumber, pageNumber),
  );
}

export async function getVolumeNumbers(mangaSlug: string) {
  const fileNames = await safelyReadDirectory(getMangaOcrDir(mangaSlug));
  return fileNames
    ?.filter(isNotHiddenFile)
    .map((volumeName) => volumeName.replace(VOLUME_PREFIX, ""));
}

export async function getMangaSlugs() {
  const fileNames = await safelyReadDirectory(MANGA_SLUGS_DIR);
  return fileNames?.filter(isNotHiddenFile);
}

export async function safelyReadFile<T>(filePath: string) {
  try {
    const ocrFile = await fs.readFile(filePath, "utf8");
    return JSON.parse(ocrFile) as T;
  } catch (error) {
    console.log(`Error during safelyReadFile: ${JSON.stringify(error)}`);
    return null;
  }
}

export async function safelyWriteFile(filePath: string, content: string) {
  try {
    await fs.writeFile(filePath, content);
    return true;
  } catch (error) {
    console.log(
      `Error during safelyWriteFile for filePath ${filePath}.\nError: ${JSON.stringify(error)}`,
    );
    return false;
  }
}

export async function safelyReadDirectory(dirPath: string) {
  try {
    const fileNames = await fs.readdir(dirPath);
    return fileNames;
  } catch (error) {
    console.log(`Error during safelyReadDirectory: ${JSON.stringify(error)}`);
    return null;
  }
}

export function safelyParseJson<T>(input: string) {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}
