import MangaPageView from "@/app/_components/mangaPageView";
import { getPageOcr } from "@/lib/ocr/utils";

export default async function MangaPage({
  params: { mangaSlug, volumeNumber, pageNumber },
}: {
  params: { mangaSlug: string; volumeNumber: string; pageNumber: string };
}) {
  const ocr = await getPageOcr(mangaSlug, volumeNumber, pageNumber);
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
