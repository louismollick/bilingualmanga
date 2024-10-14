import Image from "next/image";
import MangaPageView from "@/app/_components/mangaPageView";
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
    <>
      <MangaPageView
        mangaSlug={mangaSlug}
        volumeNumber={volumeNumber}
        pageNumber={pageNumber}
        ocr={ocr}
        image={
          <Image
            src={`/images/${mangaSlug}/jp-JP/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`}
            alt={`${mangaSlug} Volume ${volumeNumber} Page number ${pageNumber} Language jp-JP`}
            width={ocr.img_width}
            height={ocr.img_height}
            priority
            className="h-auto min-w-full select-none md:min-h-screen md:w-auto"
          />
        }
      />
    </>
  );
}
