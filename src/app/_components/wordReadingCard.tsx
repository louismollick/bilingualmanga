import React, { forwardRef } from "react";
import type {
  WordReadingForRender,
  Conj,
  Gloss,
  WordReading,
} from "@/types/ichiran";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { cn } from "@/lib/ui/utils";

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
                <span className="mr-1 text-green-600">[{prop.pos}]</span>
                <span>{prop.type}</span>
              </p>
            ))}
          {conj.reading && <p className="font-bold">{conj.reading}</p>}
          <WordGloss gloss={conj.gloss} className="ml-3 mt-1" />
          {conj.via?.length && (
            <div className="ml-4">
              via
              <WordConj conj={conj.via} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function WordReadingContent({
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
          Compound word: {wordReading.compound.join(" + ")}
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
        <p className="ml-3 mt-1">Suffix: {wordReading.suffix}</p>
      )}
      <WordConj conj={wordReading.conj} />
      <WordGloss gloss={wordReading.gloss} />
    </>
  );
}

type Props = {
  wordReading: WordReadingForRender;
} & React.HTMLAttributes<HTMLDivElement>;

export default forwardRef<HTMLDivElement, Props>(function WordReadingCard(
  { wordReading, className, ...props },
  ref,
) {
  return (
    <Card
      ref={ref}
      className={cn("max-h-96 select-text", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>{wordReading.reading}</CardTitle>
        {wordReading.romaji && (
          <CardDescription>{wordReading.romaji}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="max-h-[250px] overflow-y-scroll text-sm">
        <WordReadingContent wordReading={wordReading} showReading={false} />
      </CardContent>
    </Card>
  );
});
