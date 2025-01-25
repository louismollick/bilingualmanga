"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowBigLeft, House } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import { Slider } from "@/app/_components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import {
  type LanguageType,
  type MangaPageParams,
  Language,
} from "@/types/language";
import { useLanguage } from "@/app/_hooks/useLanguage";
import {
  DEFAULT_ZOOM_PERCENTAGE,
  useZoomPercentage,
} from "@/app/_hooks/useZoomPercentage";

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
const ZOOM_PERCENTAGES = Object.keys(ZOOM_PERCENTAGES_VH_STYLES);
const ZOOM_PERCENTAGES_REVERSED = ZOOM_PERCENTAGES.slice().reverse();
const MIN_PERCENTAGE = parseInt(ZOOM_PERCENTAGES[0]!);
const MAX_PERCENTAGE = parseInt(ZOOM_PERCENTAGES[ZOOM_PERCENTAGES.length - 1]!);
const PERCENTAGES_TO_SHOW = [DEFAULT_ZOOM_PERCENTAGE, MAX_PERCENTAGE].map(
  String,
);

export default function NavigationBar({ totalPages }: { totalPages: number }) {
  const { mangaSlug, volumeNumber, pageNumber } = useParams<MangaPageParams>();
  const { setLanguage } = useLanguage();
  const { zoomPercentage, setZoomPercentage } = useZoomPercentage();

  return (
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
        <p>
          {pageNumber}/{totalPages}
        </p>
      </div>

      <Tabs
        onValueChange={(value) => setLanguage(value as LanguageType)}
        defaultValue={Language.jpJP}
      >
        <TabsList>
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
        className="mb-2 mr-11 mt-auto h-[20%] max-md:hidden"
      >
        <span className="absolute left-5 z-10 flex h-full flex-col justify-between text-nowrap py-1 text-[0.6rem] leading-none text-accent-foreground">
          {ZOOM_PERCENTAGES_REVERSED.map((percentage) => (
            <span key={percentage} className="flex-shrink">
              <span>―</span>
              {PERCENTAGES_TO_SHOW.includes(percentage) && (
                <span className="ml-2">{`${percentage}%`}</span>
              )}
            </span>
          ))}
        </span>
      </Slider>
    </nav>
  );
}
