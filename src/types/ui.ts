import { type kanjiDetail } from "@/server/db/schema/bilingualmanga";
import { type IchiranResponse, type WordReading } from "@/types/ichiran";

// Format after processing for render
export type WordReadingForRender = WordReading & {
  text: string;
  id: string; // Used for uniquely referencing a word in speech bubble
  romaji?: string; // I move this from the Word object to WordReading object, so it's easier to access.
  isPunctuation: boolean; // Generated on render using regex
};

export type Kanji = typeof kanjiDetail.$inferSelect;

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
