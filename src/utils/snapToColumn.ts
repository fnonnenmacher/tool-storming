export const CANVAS_LEFT_MARGIN = 440;
export const COLUMN_WIDTH = 140;

export function pixelXToColumn(pixelX: number): number {
  const col = Math.round((pixelX - CANVAS_LEFT_MARGIN) / COLUMN_WIDTH) + 1;
  return Math.min(10, Math.max(1, col));
}

export function columnToPixelX(col: number): number {
  return CANVAS_LEFT_MARGIN + (col - 1) * COLUMN_WIDTH + COLUMN_WIDTH / 2;
}
