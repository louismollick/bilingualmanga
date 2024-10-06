"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { MokuroResponse } from "@/types/mokuro";
import type { IchiranResponse, WordReading } from "@/types/ichiran";
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
  const [segmentedSpeechBubble, setSegmentedSpeechBubble] =
    useState<IchiranResponse | null>(null);
  const [selectedWord, setSelectedWord] = useState<
    [number, number, WordReading] | null
  >(null);

  const oppositeLanguage = getOppositeLanguage(language);

  const imgPath = `/images/${mangaSlug}/${language}/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`;

  const toggleLanguage = () => setLanguage(getOppositeLanguage);

  const [selectedChainIdx, selectedWordIdx, selectedReading] =
    selectedWord ?? [];

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
          onClick={() => setSegmentedSpeechBubble(segmentation)}
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
        open={Boolean(segmentedSpeechBubble)}
        onClose={() => {
          setSegmentedSpeechBubble(null);
          setSelectedWord(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <p className="my-4 w-full select-text p-3 text-left text-4xl font-light text-muted-foreground lg:text-6xl">
                {Boolean(segmentedSpeechBubble?.length) &&
                  segmentedSpeechBubble?.map((wordChain, chainIdx) => {
                    // No dictionary info available
                    if (typeof wordChain === "string") {
                      if (wordChain === "\n") {
                        return <br key={`chain-${chainIdx}`} />;
                      }
                      return <span key={`chain-${chainIdx}`}>{wordChain}</span>;
                    }

                    const [[words]] = wordChain;
                    return words.map((word, wordIdx) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const [_, wordAlternatives] = word;

                      const wordReading =
                        "alternative" in wordAlternatives
                          ? wordAlternatives.alternative[0]! // just take the first one
                          : wordAlternatives;

                      return (
                        <span
                          key={`chain-${chainIdx}-word-${wordIdx}`}
                          className={cn(
                            "hover:text-accent-foreground hover:underline",
                            selectedChainIdx === chainIdx &&
                              selectedWordIdx === wordIdx &&
                              "text-accent-foreground underline",
                          )}
                          onClick={() =>
                            setSelectedWord([chainIdx, wordIdx, wordReading])
                          }
                        >
                          {wordReading.text}
                        </span>
                      );
                    });
                  })}
              </p>
            </DrawerTitle>
          </DrawerHeader>
          <div className="h-[60vh] select-text p-4 pb-0">
            {Boolean(selectedWord) ? (
              <WordReadingContent wordReading={selectedReading!} />
            ) : (
              "Select a word to view its definition."
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};

export default MangaPageView;
