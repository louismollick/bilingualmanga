"use client";

import React, { createContext, useState } from "react";

export const DEFAULT_ZOOM_PERCENTAGE = 100;

type ZoomPercentageContextValue = {
  zoomPercentage: number;
  setZoomPercentage: (zoomPercentage: number) => void;
};

const ZoomPercentageContext = createContext<ZoomPercentageContextValue>({
  zoomPercentage: DEFAULT_ZOOM_PERCENTAGE,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setZoomPercentage: () => {},
});

export function ZoomPercentageProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [zoomPercentage, setZoomPercentage] = useState<number>(
    DEFAULT_ZOOM_PERCENTAGE,
  );
  return (
    <ZoomPercentageContext.Provider
      value={{ zoomPercentage, setZoomPercentage }}
    >
      {children}
    </ZoomPercentageContext.Provider>
  );
}

export function useZoomPercentage() {
  return React.useContext(ZoomPercentageContext);
}
