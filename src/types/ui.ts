import { type WordReading } from "./ichiran";
import { type Block, type MokuroResponse } from "./mokuro";

// Format after processing for render
export type WordReadingForRender = WordReading & {
  text: string;
  id: string; // Used for uniquely referencing a word in speech bubble
  romaji?: string; // I move this from the Word object to WordReading object, so it's easier to access.
  isPunctuation: boolean; // Generated on render using regex
};

export type BlockForRender = Block & {
  wordReadings: WordReadingForRender[];
};

export type MokuroResponseForRender = MokuroResponse & {
  blocks: BlockForRender[];
};
