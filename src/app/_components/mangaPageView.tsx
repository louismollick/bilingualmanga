"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, ArrowBigLeft } from "lucide-react";

import type { MokuroResponse } from "@/types/mokuro";
import type { IchiranResponse, WordReadingForRender } from "@/types/ichiran";
import { Button } from "@/app/_components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/app/_components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { cn } from "@/lib/ui/utils";
import WordReadingContent from "@/app/_components/wordReadingContent";
import useKeyPress from "@/app/_hooks/useKeyPress";

const Language = {
  enUS: "en-US",
  jpJP: "jp-JP",
} as const;
type LanguageType = (typeof Language)[keyof typeof Language];

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
  // const volumeNumberParsed = parseInt(volumeNumber, 10);
  const pageNumberParsed = parseInt(pageNumber, 10);

  const nextPagePath = `/${mangaSlug}/${volumeNumber}/${pageNumberParsed + 1}`;
  const goToNextPage = () => router.push(nextPagePath);
  const previousPagePath = `/${mangaSlug}/${volumeNumber}/${pageNumberParsed - 1}`;
  const goToPreviousPage = () => router.push(previousPagePath);

  useKeyPress({
    ArrowLeft: goToPreviousPage,
    ArrowRight: goToNextPage,
  });

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) =>
    event.nativeEvent.clientX >= window.innerWidth / 2
      ? goToNextPage()
      : goToPreviousPage();

  useEffect(() => {
    console.log(`PREFETCHING PAGE ${nextPagePath}`);
    router.prefetch(nextPagePath);
  }, [nextPagePath, router]);

  const [language, setLanguage] = useState<LanguageType>(Language.jpJP);
  const [selectedSegmentation, setSelectedSegmentation] =
    useState<IchiranResponse | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());

  const imgPath = `/images/${mangaSlug}/${language}/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`;

  console.log(`LOADING PAGE WITH IMAGEPATH ${imgPath}`);

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
      const fontSize = `${(font_size * 100) / ocr.img_height}vh`;

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
            e.stopPropagation();
            setSelectedSegmentation(segmentation);
          }}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={`block-${blockIdx}-line-${lineIdx}`}
              className="inline-block cursor-text whitespace-nowrap opacity-0 group-hover:bg-black group-hover:opacity-100"
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
        <div className="relative h-fit w-fit bg-slate-100">
          {language === Language.jpJP && speechBubbles}
          <Image
            src={imgPath}
            alt={`${mangaSlug} Volume ${volumeNumber} Page number ${pageNumber} Language ${language}`}
            width={ocr.img_width}
            height={ocr.img_height}
            priority
            className="h-auto min-w-full select-none md:min-h-screen md:w-auto"
          />
        </div>
      </div>

      <nav className="mt-2 flex w-full items-center justify-around gap-3 text-xs md:absolute md:left-0 md:top-0 md:h-full md:w-24 md:flex-col md:justify-start md:border-r">
        <Link href="/" prefetch={false}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:mt-3 md:h-20 md:w-20"
          >
            <House className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>

        <Link href={`/${mangaSlug}`}>
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
      </nav>

      <Drawer
        open={Boolean(selectedSegmentation)}
        onClose={() => {
          setSelectedSegmentation(null);
          setSelectedWordId(null);
        }}
      >
        <DrawerContent className="h-[85vh]">
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
