"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { MokuroResponse } from "@/types/mokuro";
import type { IchiranResponse, WordReadingForRender } from "@/types/ichiran";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { cn } from "@/lib/ui/utils";
import WordReadingContent from "@/app/_components/wordReadingContent";

const Language = {
  enUS: "en-US",
  jpJP: "jp-JP",
} as const;
type LanguageType = (typeof Language)[keyof typeof Language];

const getOppositeLanguage = (currLanguage: LanguageType) => {
  if (currLanguage === Language.enUS) return Language.jpJP;
  else return Language.enUS;
};

// Regular expression to match only special characters (excluding letters in any language or numbers)
const containsOnlySpecialCharacters = (input: string) =>
  /^[^\p{L}\p{N}]+$/u.test(input);

const MangaPageView = ({
  mangaSlug,
  volumeNumber,
  pageNumber,
  ocr,
}: {
  mangaSlug: string;
  volumeNumber: string;
  pageNumber: string;
  ocr: MokuroResponse;
}) => {
  const [language, setLanguage] = useState<LanguageType>(Language.jpJP);
  const [selectedSegmentation, setSelectedSegmentation] =
    useState<IchiranResponse | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());

  const oppositeLanguage = getOppositeLanguage(language);

  const imgPath = `/images/${mangaSlug}/${language}/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`;

  const toggleLanguage = () => setLanguage(getOppositeLanguage);

  const scrollWordReadingIntoView = (wordId: string) =>
    wordRefs.current.get(wordId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

  const wordReadings = useMemo(
    () =>
      selectedSegmentation
        ? selectedSegmentation.flatMap((wordChain, wordChainIdx) => {
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

              const wordReading =
                "alternative" in wordAlternatives
                  ? wordAlternatives.alternative[0]! // just take the first one
                  : wordAlternatives;

              return {
                ...wordReading,
                id: `chain-${wordChainIdx}-word-${wordIdx}`,
                romaji,
                isPunctuation: false,
              } as WordReadingForRender;
            });
          })
        : null,
    [selectedSegmentation],
  );

  const speechBubbles = ocr.blocks.map(
    ({ box, font_size, vertical, lines, segmentation }, blockIdx) => {
      // Find the ratio/percentages for positioning the speech bubbles
      const left = `${(box[0] * 100) / ocr.img_width}%`;
      const top = `${(box[1] * 100) / ocr.img_height}%`;
      const width = `${((box[2] - box[0]) * 100) / ocr.img_width}%`;
      const height = `${((box[3] - box[1]) * 100) / ocr.img_height}%`;
      const fontSize = `${(font_size * 100) / ocr.img_height}vh`;

      return (
        <div
          key={`block-${blockIdx}`}
          className="group absolute opacity-0 hover:opacity-100"
          // You can't use dynamic styles with Tailwind. So need to use inline style prop instead.
          style={{
            left,
            top,
            width,
            height,
            fontSize,
            writingMode: vertical ? "vertical-rl" : "horizontal-tb",
          }}
          onClick={() => setSelectedSegmentation(segmentation)}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={`block-${blockIdx}-line-${lineIdx}`}
              className="inline-block whitespace-nowrap group-hover:bg-black"
            >
              {line}
            </p>
          ))}
        </div>
      );
    },
  );

  return (
    <main className="flex flex-col items-center bg-background text-accent-foreground">
      <div className="relative h-fit w-fit">
        {language === Language.jpJP && speechBubbles}
        <Image
          src={imgPath}
          alt="Dorohedoro v1 016"
          width={ocr.img_width}
          height={ocr.img_height}
          priority
          className="h-auto min-w-full md:max-h-screen md:w-auto"
        />
      </div>
      <Button onClick={toggleLanguage}>{oppositeLanguage}</Button>
      <Drawer
        open={Boolean(selectedSegmentation)}
        onClose={() => {
          setSelectedSegmentation(null);
          setSelectedWordId(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle>
              <p className="w-full select-text p-3 text-left text-4xl font-light text-muted-foreground lg:text-6xl">
                {wordReadings?.map(({ id, isPunctuation, text }) => (
                  <span
                    key={`word-${id}`}
                    className={cn(
                      !isPunctuation &&
                        "hover:text-accent-foreground hover:underline",
                      selectedWordId === id &&
                        "text-accent-foreground underline",
                    )}
                    onClick={() => {
                      scrollWordReadingIntoView(id);
                      setSelectedWordId(id);
                    }}
                  >
                    {text}
                  </span>
                ))}
              </p>
            </DrawerTitle>
          </DrawerHeader>
          <div className="grid h-[60vh] grid-cols-1 gap-4 overflow-y-scroll p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wordReadings
              ?.filter(({ isPunctuation }) => !isPunctuation)
              .map((wordReading, idx) => (
                <WordReadingContent
                  key={`wordreading-${idx}`}
                  wordReading={wordReading}
                  onClick={() => {
                    scrollWordReadingIntoView(wordReading.id);
                    setSelectedWordId(wordReading.id);
                  }}
                  ref={(node) => {
                    if (node) wordRefs.current.set(wordReading.id, node);
                    else wordRefs.current.delete(wordReading.id);
                  }}
                  className={cn(
                    selectedWordId === wordReading.id &&
                      "border-accent-foreground",
                  )}
                />
              ))}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};

export default MangaPageView;
