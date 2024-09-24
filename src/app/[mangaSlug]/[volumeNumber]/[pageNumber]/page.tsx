import Image from "next/image";
import { promises as fs } from "fs";
import type { MokuroResponse } from "@/types/mokuro";

export default async function MangaPage({
  params: { mangaSlug, volumeNumber, pageNumber },
}: {
  params: { mangaSlug: string; volumeNumber: string; pageNumber: string };
}) {
  const imgPath = `/images/${mangaSlug}/jp-JP/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.JPG`;
  const ocrFile = await fs.readFile(
    `${process.cwd()}/public/images/${mangaSlug}/jp-JP/_ocr/volume-${volumeNumber}/${pageNumber.padStart(3, "0")}.json`,
    "utf8",
  );
  const ocr = JSON.parse(ocrFile) as MokuroResponse;

  if (!ocr) return <div>Page not found.</div>;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#2e026d] text-white">
      {ocr.blocks.map(({ box, font_size, vertical, lines }, blockIdx) => (
        <div
          key={`block-${blockIdx}`}
          className="group absolute"
          style={{
            left: `${(box[0] * 100) / ocr.img_width}%`,
            top: `${(box[1] * 100) / ocr.img_height}%`,
            width: `${((box[2] - box[0]) * 100) / ocr.img_width}%`,
            height: `${((box[3] - box[1]) * 100) / ocr.img_height}%`,
            fontSize: `${(font_size * 100) / ocr.img_width}vw`,
            writingMode: vertical ? "vertical-rl" : "horizontal-tb",
          }}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={`block-${blockIdx}-line-${lineIdx}`}
              className="inline-block whitespace-nowrap group-hover:bg-black"
            >
              {line}
            </p>
          ))}
        </div>
      ))}
      <Image
        src={imgPath}
        alt="Dorohedoro v1 016"
        sizes="100vw"
        style={{
          width: "100%",
          height: "auto",
        }}
        width={ocr.img_width}
        height={ocr.img_height}
      />
    </main>
  );
}
