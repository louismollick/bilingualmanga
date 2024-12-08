import MangaPageView from "@/app/_components/mangaPageView";
import { getPageImagePath, getPageNextJsImagePath } from "@/lib/filepath/utils";
import { getPageOcr } from "@/lib/ocr/utils";
import {
  Language,
  type MangaPagePaths,
  type MangaPageParams,
} from "@/types/language";
import {
  type MokuroResponseForRender,
  type WordReadingForRender,
} from "@/types/ui";
import addWordToAnki from "@/lib/anki/addWordToAnki";
import {
  generateBackOfCard,
  generateFrontOfCard,
} from "@/lib/anki/generateCard";
import syncWithAnkiWeb from "@/lib/anki/syncWithAnkiWeb";

// Regular expression to match only special characters (excluding letters in any language or numbers)
const containsOnlySpecialCharacters = (input: string) =>
  /^[^\p{L}\p{N}]+$/u.test(input);

export default async function MangaPage({
  params,
}: {
  params: MangaPageParams;
}) {
  const { mangaSlug, volumeNumber, pageNumber } = params;
  const _ocr = await getPageOcr(mangaSlug, volumeNumber, pageNumber);
  if (!_ocr) return <div>Page not found.</div>;

  // Convert the OCR response to a format that can be rendered
  const ocr: MokuroResponseForRender = {
    ..._ocr,
    blocks: _ocr.blocks.map((block) => ({
      ...block,
      wordReadings: block.segmentation.flatMap<WordReadingForRender>(
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
    const succeedingText = sentenceWordTexts
      .slice(wordIdx + 1, wordIdx)
      .join("");

    await addWordToAnki(
      generateFrontOfCard(wordReading),
      generateBackOfCard(precedingText, succeedingText, wordReading),
    );
    await syncWithAnkiWeb();
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
    />
  );
}
