import safelyReadDirectory from "@/lib/ocr/safelyReadDirectory";
import Link from "next/link";

export default async function VolumeList({
  params: { mangaSlug },
}: {
  params: { mangaSlug: string };
}) {
  const dirPath = `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr`;

  const volumes = (await safelyReadDirectory(dirPath))
    ?.filter((mangaName) => mangaName !== ".DS_Store")
    .map((volumeName) => volumeName.replace("volume-", ""));

  if (!volumes?.length) {
    return <div>No volumes found!</div>;
  }

  return (
    <main className="container mx-auto mt-24 flex h-screen flex-col gap-6 bg-background text-accent-foreground">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        {mangaSlug}
      </h1>
      <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4">
        {volumes.map((volumeNum, idx) => (
          <Link
            key={idx}
            href={`/read/${mangaSlug}/${volumeNum}/0`}
            className="flex flex-col gap-3"
          >
            Volume {volumeNum}
          </Link>
        ))}
      </div>
    </main>
  );
}
