import React from "react";
import type { WordReading } from "@/types/ichiran";

export default function WordReadingContent({
  wordReading,
}: {
  wordReading: WordReading;
}) {
  return (
    <>
      <p className="text-base not-italic">{wordReading.kana}</p>
      {wordReading.components?.length && (
        <p>
          <ol>
            {wordReading.components.map(
              (comp, compIdx) =>
                !!comp.conj?.length && (
                  <ol key={`comp-${compIdx}`}>
                    {comp.conj.map((conj, conjIdx) => (
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
                ),
            )}
          </ol>
        </p>
      )}
      {!!wordReading.conj?.length && (
        <p>
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
        </p>
      )}
      {!!wordReading.gloss?.length && (
        <p>
          <ol>
            {wordReading.gloss.map((gloss, idx) => (
              <li key={`gloss-${idx}`}>{`${idx + 1}. ${gloss.pos} ${
                gloss.gloss
              }`}</li>
            ))}
          </ol>
        </p>
      )}
    </>
  );
}
