import { type getPageOcr } from "@/server/db/dal/manga";
import { type WordReading } from "./ichiran";

// Format after processing for render
export type WordReadingForRender = WordReading & {
  text: string;
  id: string; // Used for uniquely referencing a word in speech bubble
  romaji?: string; // I move this from the Word object to WordReading object, so it's easier to access.
  isPunctuation: boolean; // Generated on render using regex
};

export type GetPageOcrResponse = Awaited<ReturnType<typeof getPageOcr>>;

export type BlockForRender =
  NonNullable<GetPageOcrResponse>["blocks"][number] & {
    wordReadings: WordReadingForRender[];
  };

export type GetPageOcrResponseForRender = GetPageOcrResponse & {
  blocks: BlockForRender[];
};
