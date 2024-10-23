import NavigationBar from "@/app/_components/navigationBar";
import { LanguageProvider } from "@/app/_hooks/useLanguage";
import { ZoomPercentageProvider } from "@/app/_hooks/useZoomPercentage";

export default function MangaPageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LanguageProvider>
      <ZoomPercentageProvider>
        {children}
        <NavigationBar />
      </ZoomPercentageProvider>
    </LanguageProvider>
  );
}
