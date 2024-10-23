"use client";

import React, { useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/_components/ui/drawer";
import WordReadingCard from "@/app/_components/wordReadingCard";
import useKeyPress from "@/app/_hooks/useKeyPress";
import { useLanguage } from "@/app/_hooks/useLanguage";
import { useZoomPercentage } from "@/app/_hooks/useZoomPercentage";
import type { MokuroResponse } from "@/types/mokuro";
import type { IchiranResponse, WordReadingForRender } from "@/types/ichiran";
import { Language } from "@/types/language";
import { cn } from "@/lib/ui/utils";
import { getPageImagePath, getPageNextJsImagePath } from "@/lib/filepath/utils";

export const ZOOM_PERCENTAGES_VH_STYLES: Record<number, string> = {
  75: "md:h-[75vh]",
  100: "md:h-[100vh]",
  125: "md:h-[125vh]",
  150: "md:h-[150vh]",
  175: "md:h-[175vh]",
  200: "md:h-[200vh]",
  225: "md:h-[225vh]",
  250: "md:h-[250vh]",
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
  const router = useRouter();
  const pageNumberParsed = parseInt(pageNumber, 10);
  const nextPageNumStr = `${pageNumberParsed + 1}`;

  const nextPagePath = `/read/${mangaSlug}/${volumeNumber}/${nextPageNumStr}`;
  const goToNextPage = () => router.push(nextPagePath);
  const previousPagePath = `/read/${mangaSlug}/${volumeNumber}/${pageNumberParsed - 1}`;
  const goToPreviousPage = () => router.push(previousPagePath);

  useKeyPress({
    ArrowLeft: goToPreviousPage,
    ArrowRight: goToNextPage,
  });

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented) return;
    else if (e.nativeEvent.clientX >= window.innerWidth / 2) goToNextPage();
    else goToPreviousPage();
  };

  const nextImgPath = getPageNextJsImagePath(
    mangaSlug,
    volumeNumber,
    nextPageNumStr,
  );
  preload(nextImgPath, { as: "image", fetchPriority: "high" });

  const [selectedSegmentation, setSelectedSegmentation] =
    useState<IchiranResponse | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const { language } = useLanguage();
  const { zoomPercentage } = useZoomPercentage();

  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());

  const imgPath = getPageImagePath(
    mangaSlug,
    volumeNumber,
    pageNumber,
    language,
  );

  const scrollWordReadingIntoView = (wordId: string) =>
    wordRefs.current.get(wordId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

  const wordReadings = useMemo(
    () =>
      selectedSegmentation
        ? selectedSegmentation.flatMap<WordReadingForRender>(
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
          )
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
      const fontSize = `${(font_size * zoomPercentage) / ocr.img_height}vh`;

      return (
        <div
          key={`block-${blockIdx}`}
          className="group absolute border border-green-400"
          // You can't use dynamic styles with Tailwind. So need to use inline style prop instead.
          style={{
            left,
            top,
            width,
            height,
            fontSize,
            writingMode: vertical ? "vertical-rl" : "horizontal-tb",
          }}
          onClick={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault(); // Send message to parent components to not run their onClick handlers
            setSelectedSegmentation(segmentation);
          }}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={`block-${blockIdx}-line-${lineIdx}`}
              className="hidden cursor-text whitespace-nowrap group-hover:bg-black md:group-hover:inline-block"
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
      <div
        onClick={handleImageClick}
        className="flex h-full w-full cursor-pointer justify-center"
      >
        <div className="relative h-fit w-fit bg-accent">
          {language === Language.jpJP && speechBubbles}
          <Image
            src={imgPath}
            alt={`${mangaSlug} Volume ${volumeNumber} Page number ${pageNumber} Language ${language}`}
            width={ocr.img_width}
            height={ocr.img_height}
            priority
            className={cn(
              "h-auto min-w-full select-none md:w-auto",
              ZOOM_PERCENTAGES_VH_STYLES[zoomPercentage],
            )}
          />
        </div>
      </div>

      <Drawer
        open={Boolean(selectedSegmentation)}
        onClose={() => {
          setSelectedSegmentation(null);
          setSelectedWordId(null);
        }}
      >
        <DrawerContent className="h-[85vh]" aria-describedby={undefined}>
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
          <div className="grid h-full grid-cols-1 gap-4 overflow-y-scroll p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wordReadings
              ?.filter(({ isPunctuation }) => !isPunctuation)
              .map((wordReading, idx) => (
                <WordReadingCard
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
