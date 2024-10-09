import React, { forwardRef } from "react";
import type { WordReadingForRender } from "@/types/ichiran";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/ui/utils";

type Props = {
  wordReading: WordReadingForRender;
} & React.HTMLAttributes<HTMLDivElement>;

export default forwardRef<HTMLDivElement, Props>(function WordReadingContent(
  { wordReading, className, ...props },
  ref,
) {
  return (
    <Card ref={ref} className={cn("select-text", className)} {...props}>
      <CardHeader>
        <CardTitle>{wordReading.reading}</CardTitle>
        {wordReading.romaji && (
          <CardDescription>{wordReading.romaji}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="max-h-[250px] overflow-y-scroll">
        {wordReading.components?.length && (
          <ol>
            {wordReading.components.map(
              (comp, compIdx) =>
                !!comp.conj?.length && (
                  <ol key={`comp-${compIdx}`}>
                    {comp.conj.map((conj, conjIdx) => (
                      <li key={`conj-${conjIdx}`}>
                        <span>{conj.reading}</span>
                        {!!conj.gloss?.length && (
                          <ol>
                            {conj.gloss.map((gloss, glossIdx) => (
                              <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                                glossIdx + 1
                              }. ${gloss.pos} ${gloss.gloss}`}</li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                ),
            )}
          </ol>
        )}
        {!!wordReading.conj?.length && (
          <ol>
            {wordReading.conj.map((conj, conjIdx) => (
              <li key={`conj-${conjIdx}`}>
                <div>{conj.reading}</div>
                {!!conj.gloss?.length && (
                  <ol>
                    {conj.gloss.map((gloss, glossIdx) => (
                      <li key={`conj-${conjIdx}-gloss-${glossIdx}`}>{`${
                        glossIdx + 1
                      }. ${gloss.pos} ${gloss.gloss}`}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        )}
        {!!wordReading.gloss?.length && (
          <ol>
            {wordReading.gloss.map((gloss, idx) => (
              <li key={`gloss-${idx}`}>{`${idx + 1}. ${gloss.pos} ${
                gloss.gloss
              }`}</li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
});
