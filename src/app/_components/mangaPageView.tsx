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
import AnkiButton from "@/app/_components/ankiButton";
import WordReadingCard from "@/app/_components/wordReadingCard";
import useKeyPress from "@/app/_hooks/useKeyPress";
import { useLanguage } from "@/app/_hooks/useLanguage";
import { useZoomPercentage } from "@/app/_hooks/useZoomPercentage";
import {
  Language,
  type MangaPageParams,
  type MangaPagePaths,
} from "@/types/language";
import { cn } from "@/lib/ui/utils";
import { type GetPageOcrResultForRender } from "@/types/ui";
import { ZOOM_PERCENTAGES_VH_STYLES } from "@/app/_components/navigationBar";

const MangaPageView = ({
  mangaSlug,
  volumeNumber,
  pageNumber,
  ocr,
  paths,
  onAddWordToAnki,
  onCanAddWordsToAnki,
}: MangaPageParams & {
  ocr: GetPageOcrResultForRender;
  paths: MangaPagePaths;
  onAddWordToAnki: (blockIdx: number, wordIdx: number) => Promise<void>;
  onCanAddWordsToAnki: (blockIdx: number) => Promise<boolean[]>;
}) => {
  const router = useRouter();

  const goToNextPage = () => router.push(paths.nextPagePath);
  const goToPreviousPage = () => router.push(paths.previousPagePath);

  useKeyPress({
    ArrowLeft: goToPreviousPage,
    ArrowRight: goToNextPage,
  });

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented) return;
    else if (e.nativeEvent.clientX >= window.innerWidth / 2) goToNextPage();
    else goToPreviousPage();
  };

  preload(paths.nextImgPath, { as: "image", fetchPriority: "high" });

  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const { language } = useLanguage();
  const { zoomPercentage } = useZoomPercentage();

  const wordRefs = useRef<Map<number, HTMLElement>>(new Map());

  const scrollWordReadingIntoView = (wordId: number) =>
    wordRefs.current.get(wordId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

  const wordReadings =
    selectedBlockIdx !== null
      ? ocr.blocks[selectedBlockIdx]?.wordReadings
      : null;

  const speechBubbles = useMemo(
    () =>
      ocr.blocks.map(
        ({ box, fontSize: _fontSize, vertical, lines }, blockIdx) => {
          // Find the ratio/percentages for positioning the speech bubbles
          const left = `${(box[0] * 100) / ocr.imgWidth}%`;
          const top = `${(box[1] * 100) / ocr.imgHeight}%`;
          const width = `${((box[2] - box[0]) * 100) / ocr.imgWidth}%`;
          const height = `${((box[3] - box[1]) * 100) / ocr.imgHeight}%`;
          const fontSize = `${(parseFloat(_fontSize) * zoomPercentage) / ocr.imgHeight}vh`;

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
                setSelectedBlockIdx(blockIdx);
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
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoomPercentage],
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
            src={paths.imagePaths[language]}
            alt={`${mangaSlug} Volume ${volumeNumber} Page number ${pageNumber} Language ${language}`}
            width={ocr.imgWidth}
            height={ocr.imgHeight}
            priority
            className={cn(
              "h-auto min-w-full select-none md:w-auto",
              ZOOM_PERCENTAGES_VH_STYLES[zoomPercentage],
            )}
          />
        </div>
      </div>

      <Drawer
        open={selectedBlockIdx !== null}
        onClose={() => {
          setSelectedBlockIdx(null);
          setSelectedWordIdx(null);
        }}
      >
        <DrawerContent className="h-[85vh]" aria-describedby={undefined}>
          <DrawerHeader className="pb-0">
            <DrawerTitle>
              <p className="w-full select-text p-3 text-left text-4xl font-light text-muted-foreground lg:text-6xl">
                {wordReadings?.map(({ isPunctuation, text }, wordIdx) => (
                  <span
                    key={`word-${wordIdx}`}
                    className={cn(
                      !isPunctuation &&
                        "hover:text-accent-foreground hover:underline",
                      selectedWordIdx === wordIdx &&
                        "text-accent-foreground underline",
                    )}
                    onClick={() => {
                      if (isPunctuation) return;
                      scrollWordReadingIntoView(wordIdx);
                      setSelectedWordIdx(wordIdx);
                    }}
                  >
                    {text}
                  </span>
                ))}
              </p>
            </DrawerTitle>
          </DrawerHeader>
          <div className="grid h-full grid-cols-1 gap-4 overflow-y-scroll p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wordReadings?.map((wordReading, wordIdx) =>
              wordReading.isPunctuation ? null : (
                <WordReadingCard
                  key={`wordreading-${wordIdx}`}
                  wordReading={wordReading}
                  onClick={() => {
                    scrollWordReadingIntoView(wordIdx);
                    setSelectedWordIdx(wordIdx);
                  }}
                  ref={(node) => {
                    if (node) wordRefs.current.set(wordIdx, node);
                    else wordRefs.current.delete(wordIdx);
                  }}
                  className={cn(
                    selectedWordIdx === wordIdx && "border-accent-foreground",
                  )}
                  ankiBtn={
                    selectedBlockIdx !== null ? (
                      <AnkiButton
                        blockIdx={selectedBlockIdx}
                        wordIdx={wordIdx}
                        onAddWordToAnki={onAddWordToAnki}
                        onCanAddWordsToAnki={onCanAddWordsToAnki}
                      />
                    ) : null
                  }
                />
              ),
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};

export default MangaPageView;
