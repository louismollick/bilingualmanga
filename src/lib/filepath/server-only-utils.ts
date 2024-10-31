"server-only";

import { Language } from "@/types/language";
import { getPageFileName, VOLUME_PREFIX } from "@/lib/filepath/utils";

// export const MANGA_SLUGS_DIR = `${process.cwd()}/images`;
export const MANGA_SLUGS_DIR = `/app/images`;

console.log(`MANGA_SLUGS_DIR: ${process.cwd()}/images`);

export const getMangaOcrDir = (mangaSlug: string) =>
  `${MANGA_SLUGS_DIR}/${mangaSlug}/${Language.jpJP}/_ocr`;

export const getPageOcrPath = (
  mangaSlug: string,
  volumeNumber: string,
  pageNumber: string,
) =>
  `${getMangaOcrDir(mangaSlug)}/${VOLUME_PREFIX}${volumeNumber}/${getPageFileName(pageNumber, ".json")}`;
