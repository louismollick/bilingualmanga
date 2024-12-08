import FrontOfAnkiCard from "@/app/_components/anki/frontOfAnkiCard";
import { type WordReadingForRender } from "@/types/ui";
import BackOfAnkiCard from "@/app/_components/anki/backOfAnkiCard";

const ReactDOMServer = (await import("react-dom/server")).default;

export const generateFrontOfCard = (wordReading: WordReadingForRender) =>
  ReactDOMServer.renderToStaticMarkup(
    <FrontOfAnkiCard text={wordReading.text} />,
  );

export const generateBackOfCard = (
  precedingText: string,
  succeedingText: string,
  wordReading: WordReadingForRender,
) =>
  ReactDOMServer.renderToStaticMarkup(
    <BackOfAnkiCard
      wordReading={wordReading}
      precedingText={precedingText}
      succeedingText={succeedingText}
    />,
  );
