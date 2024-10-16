import { Language, type LanguageType } from "@/types/language";

export const VOLUME_PREFIX = "volume-";

export const getPageFileName = (pageNumber: string, extension: string) =>
  `${pageNumber.padStart(3, "0")}${extension}`;

export const getPageImagePath = (
  mangaSlug: string,
  volumeNumber: string,
  pageNumber: string,
  language: LanguageType,
) =>
  `/images/${mangaSlug}/${language}/${VOLUME_PREFIX}${volumeNumber}/${getPageFileName(pageNumber, ".JPG")}`;

export const getPageNextJsImagePath = (
  mangaSlug: string,
  volumeNumber: string,
  pageNumber: string,
) =>
  `/_next/image?url=${encodeURIComponent(getPageImagePath(mangaSlug, volumeNumber, pageNumber, Language.jpJP))}&w=1920&q=75`;
