import MangaPageView from "@/app/_components/mangaPageView";
import { getPageOcr } from "@/lib/ocr/utils";
import { type MangaPageParams } from "@/types/language";

export default async function MangaPage({
  params: { mangaSlug, volumeNumber, pageNumber },
}: {
  params: MangaPageParams;
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
