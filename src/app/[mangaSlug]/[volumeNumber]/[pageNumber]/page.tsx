import { promises as fs } from "fs";
import type { MokuroResponse } from "@/types/mokuro";
import MangaPageView from "@/app/_components/MangaPageView";

export default async function MangaPage({
  params: { mangaSlug, volumeNumber, pageNumber },
}: {
  params: { mangaSlug: string; volumeNumber: string; pageNumber: string };
}) {
  const ocrFile = await fs.readFile(
    `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.json`,
    "utf8",
  );
  const ocr = JSON.parse(ocrFile) as MokuroResponse;

  if (!ocr) return <div>Page not found.</div>;

  return (
    <MangaPageView
      mangaSlug={mangaSlug}
      volumeNumber={volumeNumber}
      pageNumber={pageNumber}
      ocr={ocr}
    />
  );
}
