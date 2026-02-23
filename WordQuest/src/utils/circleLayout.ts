import { SIZES } from '../constants/sizes';

export interface LetterPosition {
  x: number;       // left: offset from container left edge
  y: number;       // top: offset from container top edge
  centerX: number; // center of button X (for hitTest and drawing line)
  centerY: number; // center of button Y
}

/**
 * Calculates positions of N buttons evenly distributed in a circle.
 * The first letter is always at the top (angle -π/2).
 *
 * @param count     number of letters
 * @param containerSize  width/height of the square container
 */
export function getCirclePositions(count: number, containerSize: number): LetterPosition[] {
  const btnSize = SIZES.LETTER_BUTTON_SIZE;   // 56px
  const radius = containerSize / 2 - btnSize / 2 - 8;
  const cx = containerSize / 2;
  const cy = containerSize / 2;

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI / count) * i - Math.PI / 2;
    const centerX = cx + radius * Math.cos(angle);
    const centerY = cy + radius * Math.sin(angle);
    return {
      x: centerX - btnSize / 2,
      y: centerY - btnSize / 2,
      centerX,
      centerY,
    };
  });
}

/**
 * Checks if a touch point (px, py) hits a button with center (cx, cy).
 * Euclidean distance < HIT_RADIUS (28px).
 */
export function hitTestLetter(px: number, py: number, cx: number, cy: number): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return (dx * dx + dy * dy) <= SIZES.HIT_RADIUS * SIZES.HIT_RADIUS;
}
