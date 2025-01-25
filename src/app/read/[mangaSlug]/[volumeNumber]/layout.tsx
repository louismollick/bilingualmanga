import NavigationBar from "@/app/_components/navigationBar";
import { LanguageProvider } from "@/app/_hooks/useLanguage";
import { ZoomPercentageProvider } from "@/app/_hooks/useZoomPercentage";
import { getVolumeTotalPages } from "@/server/db/dal/manga";
import { type MangaPageParams } from "@/types/language";

export default async function MangaPageLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: MangaPageParams }>) {
  const totalPages = await getVolumeTotalPages(
    params.mangaSlug,
    parseInt(params.volumeNumber),
  );
  return (
    <LanguageProvider>
      <ZoomPercentageProvider>
        {children}
        <NavigationBar totalPages={totalPages} />
      </ZoomPercentageProvider>
    </LanguageProvider>
  );
}
