export type IchiranResponse = (
  | WordChainWithScore
  | string
)[]; /* string = word not found, e.g, foreign characters, punctuation */

export type WordChainWithScore = [[Word[], number]];

export type Word = [
  string /* romanji reading */,
  WordAlternatives,
  [] /* empty array? */,
];

export type WordAlternatives =
  | {
      alternative: WordReading[];
    }
  | WordReading;

// Raw format we receive fromt Ichiran
export type WordReading = {
  reading?: string;
  text?: string;
  kana?: string;
  score?: number;
  seq?: number;
  gloss?: Gloss[];
  conj?: Conj[];
  compound?: string[];
  components?: WordReading[];
  suffix?: string;
};

// Format after processing for render
export type WordReadingForRender = WordReading & {
  text: string;
  id: string; // Used for uniquely referencing a word in speech bubble
  romaji?: string; // I move this from the Word object to WordReading object, so it's easier to access.
  isPunctuation: boolean; // Generated on render using regex
};

export type Gloss = {
  pos: string;
  gloss: string;
  info?: string;
};

export type Conj = {
  prop: Prop[];
  reading: string;
  gloss?: Gloss[];
  readok: boolean;
};

export type Prop = {
  pos: string;
  type: string;
};
