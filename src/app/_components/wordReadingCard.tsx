import React, { forwardRef, type ReactNode } from "react";
import Image from "next/image";
import type { Conj, Gloss, WordReading } from "@/types/ichiran";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { cn } from "@/lib/ui/utils";
import { type WordReadingForRender } from "@/types/ui";

function WordGloss({
  gloss,
  className,
  ...props
}: { gloss?: Gloss[] } & React.HTMLAttributes<HTMLOListElement>) {
  if (!gloss?.length) return;

  return (
    <ol className={cn("list-inside list-decimal", className)} {...props}>
      {gloss.map((gloss, glossIdx) => (
        <li key={glossIdx} className="mb-1">
          <span className="mr-1 text-green-600">{gloss.pos}</span>
          <span>{gloss.gloss}</span>
        </li>
      ))}
    </ol>
  );
}

function WordConj({ conj }: { conj?: Conj[] }) {
  if (!conj?.length) return;

  return (
    <ol>
      {conj.map((conj, conjIdx) => (
        <li key={conjIdx}>
          {!!conj.prop?.length &&
            conj.prop.map((prop, propIdx) => (
              <p key={propIdx} className="mb-1">
                <span className="mr-1 text-green-600">{`[${prop.pos}]`}</span>
                <span className="text-muted-foreground">{prop.type}</span>
              </p>
            ))}
          {conj.reading && <p className="font-bold">{conj.reading}</p>}
          <WordGloss gloss={conj.gloss} className="ml-3 mt-1" />
          {conj.via?.length && (
            <div className="ml-4">
              <span className="text-muted-foreground">{"via"}</span>
              <WordConj conj={conj.via} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function WordReadingContent({
  wordReading,
  showReading = true,
}: {
  wordReading: WordReading;
  showReading?: boolean;
}) {
  return (
    <>
      {showReading && <p className="py-1 font-bold">{wordReading.reading}</p>}
      {wordReading.compound?.length && (
        <p className="my-1">
          <span className="text-muted-foreground">{"Compound word: "}</span>
          {wordReading.compound.join(" + ")}
        </p>
      )}
      {wordReading.components?.length && (
        <ol>
          {wordReading.components.map((comp, compIdx) => (
            <WordReadingContent key={compIdx} wordReading={comp} />
          ))}
        </ol>
      )}
      {wordReading.suffix && (
        <p className="ml-3 mt-1">
          <span className="text-muted-foreground">{"Suffix: "}</span>
          {wordReading.suffix}
        </p>
      )}
      <WordConj conj={wordReading.conj} />
      <WordGloss gloss={wordReading.gloss} />
    </>
  );
}

type Props = {
  wordReading: WordReadingForRender;
  onAddWordToAnki?: () => void;
  sentence?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export default forwardRef<HTMLDivElement, Props>(function WordReadingCard(
  { wordReading, onAddWordToAnki, sentence, className, ...props },
  ref,
) {
  return (
    <Card
      ref={ref}
      className={cn("max-h-96 select-text", className)}
      {...props}
    >
      <CardHeader className="relative">
        {onAddWordToAnki && (
          <Button
            variant="ghost"
            className="absolute right-0 top-0 py-0"
            onClick={onAddWordToAnki}
          >
            <Image
              src="/add-to-anki.svg"
              alt="Add this word to Anki"
              width={40}
              height={40}
            />
          </Button>
        )}
        <CardTitle>{wordReading.reading}</CardTitle>
        {wordReading.romaji && (
          <CardDescription>{wordReading.romaji}</CardDescription>
        )}
        {sentence}
      </CardHeader>
      <CardContent className="max-h-[250px] overflow-y-scroll text-sm">
        <WordReadingContent wordReading={wordReading} showReading={false} />
      </CardContent>
    </Card>
  );
});
