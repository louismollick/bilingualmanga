import MangaPageView from "@/app/_components/mangaPageView";
import { getPageImagePath, getPageNextJsImagePath } from "@/lib/filepath/utils";
import { getPageOcr } from "@/lib/ocr/utils";
import {
  Language,
  type MangaPagePaths,
  type MangaPageParams,
} from "@/types/language";

export default async function MangaPage({
  params,
}: {
  params: MangaPageParams;
}) {
  const { mangaSlug, volumeNumber, pageNumber } = params;
  const ocr = await getPageOcr(mangaSlug, volumeNumber, pageNumber);
  if (!ocr) return <div>Page not found.</div>;

  const pageNumberParsed = parseInt(pageNumber, 10);
  const paths: MangaPagePaths = {
    nextPagePath: `/read/${mangaSlug}/${volumeNumber}/${pageNumberParsed + 1}`,
    previousPagePath: `/read/${mangaSlug}/${volumeNumber}/${pageNumberParsed - 1}`,
    imagePaths: {
      [Language.enUS]: getPageImagePath(
        mangaSlug,
        volumeNumber,
        pageNumber,
        Language.enUS,
      ),
      [Language.jpJP]: getPageImagePath(
        mangaSlug,
        volumeNumber,
        pageNumber,
        Language.jpJP,
      ),
    },
    nextImgPath: getPageNextJsImagePath(
      mangaSlug,
      volumeNumber,
      `${pageNumberParsed + 1}`,
    ),
  };

  return <MangaPageView {...params} ocr={ocr} paths={paths} />;
}
