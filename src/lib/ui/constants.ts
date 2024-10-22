// Tailwind needs the percentage values to be statically defined at build-time.
export const ZOOM_PERCENTAGES_VH_STYLES: Record<number, string> = {
  75: "md:h-[75vh]",
  100: "md:h-[100vh]",
  125: "md:h-[125vh]",
  150: "md:h-[150vh]",
  175: "md:h-[175vh]",
  200: "md:h-[200vh]",
  225: "md:h-[225vh]",
  250: "md:h-[250vh]",
};
export const ZOOM_PERCENTAGES = Object.keys(ZOOM_PERCENTAGES_VH_STYLES);
export const ZOOM_PERCENTAGES_REVERSED = ZOOM_PERCENTAGES.slice().reverse();
export const MIN_PERCENTAGE = parseInt(ZOOM_PERCENTAGES[0]!);
export const MAX_PERCENTAGE = parseInt(ZOOM_PERCENTAGES[ZOOM_PERCENTAGES.length - 1]!);