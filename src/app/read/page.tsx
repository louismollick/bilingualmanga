import Link from "next/link";
import Image from "next/image";
import { getManga } from "@/server/db/dal/manga";

export const dynamic = "force-dynamic";

export default async function Home() {
  const mangaSlugs = await getManga();

  if (!mangaSlugs?.length) return <div>No manga found!</div>;

  return (
    <main className="container mx-auto mt-24 flex h-screen flex-col gap-6 bg-background text-accent-foreground">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Bilingual <span className="text-[hsl(280,100%,70%)]">Manga</span>
      </h1>
      <div className="grid h-full grid-cols-1 gap-4 overflow-y-scroll p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mangaSlugs.map(({ slug, enName, jpName, author }, idx) => (
          <Link
            key={idx}
            href={`/read/${slug}`}
            className="flex flex-col gap-3"
          >
            <div className="relative h-80">
              <Image
                alt={`${enName} cover`}
                src="/images/dorohedoro/jp-JP/volume-2/003.JPG"
                fill
                className="object-contain object-left"
              />
            </div>

            <p>{`${enName} (${jpName}) by ${author}`}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
