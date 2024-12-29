import React, { forwardRef } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { type ChartConfig, ChartContainer } from "@/app/_components/ui/chart";
import { cn } from "@/lib/ui/utils";
import { type Kanji } from "@/types/ui";

const BAR_HEIGHT = 20; // px
const NUM_COLORS = 5; // We only have 5 chart colors defined in globals.css

type Props = {
  kanji: Kanji;
} & React.HTMLAttributes<HTMLDivElement>;

export default forwardRef<HTMLDivElement, Props>(function WordReadingCard(
  { kanji, className, ...props },
  ref,
) {
  const yAxisWidth =
    Math.max(...kanji.readings.map((reading) => reading.kana.length)) * 15;

  const chartConfig = kanji.readings.reduce((acc: ChartConfig, reading) => {
    acc[reading.kana] = {
      label: reading.kana,
    };
    return acc;
  }, {});

  return (
    <Card
      ref={ref}
      className={cn("max-h-96 select-text", className)}
      {...props}
    >
      <CardHeader className="relative">
        <CardTitle>{kanji.text}</CardTitle>
        <CardDescription>{kanji.meanings.join("; ")}</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[250px] overflow-y-scroll text-base">
        <p className="mb-2 text-sm font-medium">Reading frequency</p>
        <ChartContainer
          config={chartConfig}
          height={kanji.readings.length * BAR_HEIGHT + BAR_HEIGHT}
          className="aspect-auto w-full"
        >
          <BarChart
            accessibilityLayer
            margin={{ top: 5, right: 50, left: 5, bottom: 5 }}
            data={kanji.readings}
            barSize={BAR_HEIGHT}
            layout="vertical"
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="kana"
              width={yAxisWidth}
              interval={0}
              type="category"
            />
            <Bar
              dataKey="perc"
              label={{
                position: "right",
                formatter: (value: number) => {
                  const rounded = value.toFixed(1);
                  if (rounded === "0.0") return "<0.1%";
                  return `${rounded}%`;
                },
              }}
              radius={4}
            >
              {kanji.readings.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={`hsl(var(--chart-${(idx % NUM_COLORS) + 1}))`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="my-2 text-sm font-medium">Common words</p>
        {kanji.commonWords.map((word) => (
          <p key={word.seq} className="mb-1 text-muted-foreground">
            <span className="text-lg text-foreground">
              {`${word.text} 【${word.kana}】`}
            </span>
            {` - ${word.gloss.join("; ")}`}
          </p>
        ))}
      </CardContent>
    </Card>
  );
});
