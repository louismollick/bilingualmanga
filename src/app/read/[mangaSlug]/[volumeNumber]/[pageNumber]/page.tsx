import MangaPageView from "@/app/_components/mangaPageView";
import { getPageImagePath, getPageNextJsImagePath } from "@/lib/filepath/utils";
import {
  Language,
  type MangaPagePaths,
  type MangaPageParams,
} from "@/types/language";
import {
  type GetPageOcrResultForRender,
  type WordReadingForRender,
} from "@/types/ui";
import addWordToAnki from "@/lib/anki/addWordToAnki";
import {
  generateBackOfCard,
  generateFrontOfCard,
} from "@/lib/anki/generateCard";
import syncWithAnkiWeb from "@/lib/anki/syncWithAnkiWeb";
import canAddWordsToAnki from "@/lib/anki/canAddWordsToAnki";
import mapOnlyFilteredItems from "@/lib/utils/mapOnlyFilteredItems";
import { getPageOcr } from "@/server/db/dal/manga";

// Regular expression to match only special characters (excluding letters in any language or numbers)
const containsOnlySpecialCharacters = (input: string) =>
  /^[^\p{L}\p{N}]+$/u.test(input);

export default async function MangaPage({
  params,
}: {
  params: MangaPageParams;
}) {
  const { mangaSlug, volumeNumber, pageNumber } = params;
  const _ocr = await getPageOcr(
    mangaSlug,
    parseInt(volumeNumber),
    parseInt(pageNumber),
  );

  if (!_ocr) return <div>Page not found.</div>;

  // Convert the OCR response to a format that can be rendered
  const ocr: GetPageOcrResultForRender = {
    ..._ocr,
    blocks: _ocr.blocks.map((block) => ({
      ...block,
      wordReadings: block.segmentation!.flatMap<WordReadingForRender>(
        (wordChain, wordChainIdx) => {
          // Edge case when dictionary info available
          if (typeof wordChain === "string")
            return {
              id: `chain-${wordChainIdx}`,
              reading: wordChain,
              text: wordChain,
              isPunctuation: containsOnlySpecialCharacters(wordChain),
            };

          const [[words]] = wordChain;
          return words.map((word, wordIdx) => {
            const [romaji, wordAlternatives] = word;

            // If we have alternative readings, just take the first one.
            const wordReading =
              "alternative" in wordAlternatives
                ? wordAlternatives.alternative[0]!
                : wordAlternatives;

            return {
              ...wordReading,
              id: `chain-${wordChainIdx}-word-${wordIdx}`,
              romaji,
              text: wordReading.text!,
              isPunctuation: false,
            };
          });
        },
      ),
    })),
  };

  // Add word to Anki
  const onAddWordToAnki = async (blockIdx: number, wordIdx: number) => {
    "use server";
    const block = ocr.blocks[blockIdx];
    const wordReading = block?.wordReadings[wordIdx];

    if (!wordReading) {
      console.error(
        `Word reading not found. blockIdx: ${blockIdx}, wordIdx: ${wordIdx}`,
      );
      return;
    }

    // Color the word in the sentence
    const sentenceWordTexts = block.wordReadings.map((reading) => reading.text);
    const precedingText = sentenceWordTexts.slice(0, wordIdx).join("");
    const succeedingText = sentenceWordTexts.slice(wordIdx + 1).join("");

    await addWordToAnki(
      generateFrontOfCard(wordReading),
      generateBackOfCard(precedingText, succeedingText, wordReading),
    );
    await syncWithAnkiWeb();
  };

  // Check if notes can be added to Anki (i.e if they're not already in the deck)
  const onCanAddWordsToAnki = async (blockIdx: number) => {
    "use server";
    const wordReadings = ocr.blocks[blockIdx]?.wordReadings;

    if (!wordReadings) {
      const message = `Word readings not found. blockIdx: ${blockIdx}`;
      console.error(message);
      throw new Error(message);
    }

    try {
      return await mapOnlyFilteredItems(
        wordReadings,
        (wordReading) => !wordReading.isPunctuation,
        (wordReadings) =>
          canAddWordsToAnki(wordReadings.map((word) => word.text)),
        false,
      );
    } catch (error) {
      console.error(
        `Error checking if notes can be added to Anki: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  };

  const pageNumberParsed = parseInt(pageNumber, 10);
  const paths: MangaPagePaths = {
    nextPagePath: `/read/${mangaSlug}/${volumeNumber}/${pageNumberParsed + 1}`,
    previousPagePath: `/read/${mangaSlug}/${volumeNumber}/${pageNumberParsed - 1}`,
    imagePaths: {
      [Language.enUS]: getPageImagePath(
        mangaSlug,
        volumeNumber,
        pageNumber,
        Language.enUS,
      ),
      [Language.jpJP]: getPageImagePath(
        mangaSlug,
        volumeNumber,
        pageNumber,
        Language.jpJP,
      ),
    },
    nextImgPath: getPageNextJsImagePath(
      mangaSlug,
      volumeNumber,
      `${pageNumberParsed + 1}`,
    ),
  };

  return (
    <MangaPageView
      {...params}
      ocr={ocr}
      paths={paths}
      onAddWordToAnki={onAddWordToAnki}
      onCanAddWordsToAnki={onCanAddWordsToAnki}
    />
  );
}
