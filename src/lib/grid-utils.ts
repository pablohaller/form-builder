import type { FormField, GridConfig, GapUnit } from "@/types";

export const gapToPx = (gap: number, unit: GapUnit): number => {
  switch (unit) {
    case "px": return gap;
    case "rem": return gap * 16;
    case "em": return gap * 16;
  }
};

export const calcEffectiveRows = (fields: FormField[], minRows: number): number =>
  Math.max(minRows, ...fields.map((f) => f.y + f.h), 1);

export const findFreeCell = (
  fields: FormField[],
  grid: GridConfig
): { x: number; y: number } => {
  const rows = calcEffectiveRows(fields, grid.rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < grid.cols; x++) {
      const occupied = fields.some((f) => f.x === x && f.y === y);
      if (!occupied) return { x, y };
    }
  }
  return { x: 0, y: rows };
};
