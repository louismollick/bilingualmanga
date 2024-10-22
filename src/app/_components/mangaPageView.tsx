"use client";

import React, { useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, ArrowBigLeft } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/_components/ui/drawer";
import { Button } from "@/app/_components/ui/button";
import { Slider } from "@/app/_components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";

import {
  ZOOM_PERCENTAGES_VH_STYLES,
  MIN_PERCENTAGE,
  MAX_PERCENTAGE,
} from "@/lib/ui/constants";
import type { MokuroResponse } from "@/types/mokuro";
import type { IchiranResponse, WordReadingForRender } from "@/types/ichiran";
import { Language, type LanguageType } from "@/types/language";
import WordReadingCard from "@/app/_components/wordReadingCard";
import useKeyPress from "@/app/_hooks/useKeyPress";
import { cn } from "@/lib/ui/utils";
import { getPageImagePath, getPageNextJsImagePath } from "@/lib/filepath/utils";

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

  const [language, setLanguage] = useState<LanguageType>(Language.jpJP);
  const [selectedSegmentation, setSelectedSegmentation] =
    useState<IchiranResponse | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [zoomPercentage, setZoomPercentage] = useState<number>(100);
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

      <nav className="flex w-full items-center justify-around gap-3 text-xs md:fixed md:left-0 md:top-0 md:h-full md:w-24 md:flex-col md:justify-start md:border-r">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="mt-2 h-10 w-10 md:mt-3 md:h-20 md:w-20"
          >
            <House className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>

        <Link href={`/read/${mangaSlug}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:h-20 md:w-20"
          >
            <ArrowBigLeft className="h-5 w-5" />
            <span className="sr-only">Back to manga</span>
          </Button>
        </Link>

        <div className="flex flex-col items-center justify-center md:h-20 md:w-20">
          <p>Volume</p>
          <p>{volumeNumber}</p>
        </div>

        <div className="flex flex-col items-center justify-center md:h-20 md:w-20">
          <p>Page</p>
          <p>{pageNumber}</p>
        </div>

        <Tabs
          onValueChange={(value) => setLanguage(value as LanguageType)}
          defaultValue={Language.jpJP}
        >
          <TabsList className="md:w-20">
            <TabsTrigger
              value={Language.jpJP}
              className="text-zinc-600 dark:text-zinc-200"
            >
              🇯🇵
            </TabsTrigger>
            <TabsTrigger
              value={Language.enUS}
              className="text-zinc-600 dark:text-zinc-200"
            >
              🇺🇸
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Slider
          min={MIN_PERCENTAGE}
          defaultValue={[100]}
          max={MAX_PERCENTAGE}
          orientation="vertical"
          step={25}
          value={[zoomPercentage]}
          onValueChange={([zoom]) => setZoomPercentage(zoom!)}
          className="mb-2 mr-10 mt-auto h-[20%] max-md:hidden"
        />
      </nav>
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
