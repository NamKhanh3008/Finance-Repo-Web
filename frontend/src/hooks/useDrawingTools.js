import { useState, useCallback } from "react";

export function useDrawingTools(readOnly) {
  const [drawingColor, setDrawingColorState] = useState(null);

  const setDrawingColor = useCallback(
    (color) => {
      if (readOnly) return;
      setDrawingColorState(color);
    },
    [readOnly]
  );

  const clearDrawingTool = useCallback(() => {
    setDrawingColorState(null);
  }, []);

  return {
    drawingColor,
    setDrawingColor,
    clearDrawingTool,
  };
}
