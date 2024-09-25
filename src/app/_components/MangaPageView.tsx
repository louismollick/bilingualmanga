"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config";

import type { MokuroResponse } from "@/types/mokuro";
import { Button } from "./ui/button";
import dynamic from "next/dynamic";

const twConfig = resolveConfig(tailwindConfig);

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
  const oppositeLanguage = getOppositeLanguage(language);

  const imgPath = `/images/${mangaSlug}/${language}/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`;
  const isDesktop = useMediaQuery({
    query: `(min-width: ${twConfig.theme.screens.md})`,
  });

  const toggleLanguage = () => setLanguage(getOppositeLanguage);

  const speechBubbles = ocr.blocks.map(
    ({ box, font_size, vertical, lines }, blockIdx) => {
      // Find the ratio/percentages for positioning the speech bubbles
      const left = `${(box[0] * 100) / ocr.img_width}%`;
      const top = `${(box[1] * 100) / ocr.img_height}%`;
      const width = `${((box[2] - box[0]) * 100) / ocr.img_width}%`;
      const height = `${((box[3] - box[1]) * 100) / ocr.img_height}%`;
      // But fontsize calculation depends on isDesktop
      const fontFullHeight = `${(font_size * 100) / ocr.img_height}vh`;
      const fontFullWidth = `${(font_size * 100) / ocr.img_width}vw`;
      const fontSize = isDesktop ? fontFullHeight : fontFullWidth;

      return (
        <div
          key={`block-${blockIdx}`}
          className="group absolute opacity-0 hover:opacity-100"
          style={{
            left,
            top,
            width,
            height,
            fontSize,
            writingMode: vertical ? "vertical-rl" : "horizontal-tb",
          }}
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
    <main className="flex flex-col items-center bg-background text-white">
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
    </main>
  );
};

/**
 * Since I use inline styles, we don't want NextJs to do any SSR for layouts.
 * I turned it off entirely for now, until I find a better solution (styled components?)
 */
export default dynamic(() => Promise.resolve(MangaPageView), {
  ssr: false,
});
