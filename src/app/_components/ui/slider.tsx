"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/ui/utils";
import { ZOOM_PERCENTAGES_REVERSED } from "@/lib/ui/constants";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex cursor-pointer touch-none select-none items-center justify-center",
      orientation === "horizontal" ? "w-full" : "h-full",
      className,
    )}
    onKeyDown={(e) => e.preventDefault()} // Don't move when arrow keys are pressed
    orientation={orientation}
    {...props}
  >
    {ZOOM_PERCENTAGES_REVERSED.map((percentage, idx) => (
      <div
        key={percentage}
        style={{
          top: `${(idx / ZOOM_PERCENTAGES_REVERSED.length) * 100}%`,
        }}
        className="absolute left-5 z-10 text-accent-foreground"
      >
        {percentage === "100" ? "―" : "-"}
      </div>
    ))}
    <SliderPrimitive.Track
      className={cn(
        "relative grow overflow-hidden rounded-full bg-secondary",
        orientation === "horizontal" ? "h-2 w-full" : "h-full w-2",
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute bg-primary",
          orientation === "horizontal" ? "h-full" : "w-full",
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
