import React from "react";
import WordReadingCard from "@/app/_components/wordReadingCard";
import { type WordReadingForRender } from "@/types/ui";

function BackOfAnkiCard({
  wordReading,
  precedingText,
  succeedingText,
}: {
  wordReading: WordReadingForRender;
  precedingText: string;
  succeedingText: string;
}) {
  return (
    <WordReadingCard
      className="dark bg-background text-accent-foreground"
      wordReading={wordReading}
      sentence={
        <p className="text-sm">
          {precedingText}
          <span className="text-green-600">{wordReading.text}</span>
          {succeedingText}
        </p>
      }
    />
  );
}

export default BackOfAnkiCard;
