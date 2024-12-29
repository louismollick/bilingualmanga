export const Language = {
  enUS: "en-US",
  jpJP: "jp-JP",
} as const;
export type LanguageType = (typeof Language)[keyof typeof Language];

export const SegmentationMode = {
  words: "words",
  kanjis: "kanjis",
} as const;
export type SegmentationModeType =
  (typeof SegmentationMode)[keyof typeof SegmentationMode];

export type MangaPageParams = {
  mangaSlug: string;
  volumeNumber: string;
  pageNumber: string;
};

export type MangaPagePaths = {
  nextPagePath: string;
  previousPagePath: string;
  imagePaths: {
    [key in LanguageType]: string;
  };
  nextImgPath: string;
};
