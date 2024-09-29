import MangaPageView from "@/app/_components/MangaPageView";
import safelyReadOcrFile from "@/lib/ocr/safelyReadOcrFile";

export default async function MangaPage({
  params: { mangaSlug, volumeNumber, pageNumber },
}: {
  params: { mangaSlug: string; volumeNumber: string; pageNumber: string };
}) {
  const ocr = await safelyReadOcrFile(
    `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.json`,
  );
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
