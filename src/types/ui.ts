import { type IchiranResponse, type WordReading } from "./ichiran";

// Format after processing for render
export type WordReadingForRender = WordReading & {
  text: string;
  id: string; // Used for uniquely referencing a word in speech bubble
  romaji?: string; // I move this from the Word object to WordReading object, so it's easier to access.
  isPunctuation: boolean; // Generated on render using regex
};

export type Reading = {
  kana: string;
  perc: number;
  type: string;
  num_words: number;
};

export type CommonWord = {
  seq: number;
  text: string;
  kana: string;
  common: number;
  kanji: string;
  wordnum: number;
  gloss: string[];
};

export type Kanji = {
  id: number;
  text: string;
  freq: number;
  grade: number;
  strokes: number;
  stat_common: number;
  readings: Reading[];
  meanings: string[];
  commonWords: CommonWord[];
};

export type GetPageOcrResult = {
  imgWidth: number;
  imgHeight: number;
  blocks: {
    id: number;
    mangaPageId: number;
    blockNum: number;
    box: [number, number, number, number];
    vertical: boolean;
    fontSize: string;
    lineCoords: [number, number][][];
    lines: string[];
    segmentation: IchiranResponse | null;
    kanji: Kanji[] | null;
  }[];
};

export type GetPageOcrResultForRender = GetPageOcrResult & {
  blocks: (NonNullable<GetPageOcrResult>["blocks"][number] & {
    wordReadings: WordReadingForRender[];
  })[];
};
