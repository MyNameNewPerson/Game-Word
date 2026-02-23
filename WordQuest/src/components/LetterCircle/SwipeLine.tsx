import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

export interface SwipeLineHandle {
  /** Fix a point (letter captured) */
  addPoint: (x: number, y: number) => void;
  /** Update current point (finger position) */
  updateCurrentPoint: (x: number, y: number) => void;
  /** Clear the line (finger lifted) */
  clear: () => void;
  /** Paint the line red (error) */
  setError: (isError: boolean) => void;
}

export const SwipeLine = forwardRef<SwipeLineHandle>((_, ref) => {
  // ref to SVG Path — updated directly via setNativeProps
  const pathRef = useRef<any>(null);
  // Fixed points (letters already captured)
  const fixedPoints = useRef<Array<{ x: number; y: number }>>([]);
  const isError = useRef(false);

  useImperativeHandle(ref, () => ({
    addPoint(x, y) {
      fixedPoints.current.push({ x, y });
      redrawPath();
    },
    updateCurrentPoint(x, y) {
      redrawPath(x, y);
    },
    clear() {
      fixedPoints.current = [];
      isError.current = false;
      pathRef.current?.setNativeProps({ d: '' });
    },
    setError(error) {
      isError.current = error;
      // Line color will update on next redrawPath, or we can force it
      // But usually error is set before clearing or during validation
      // Here we just update the state. To reflect immediately we might need to redraw.
      redrawPath();
    },
  }));

  function redrawPath(currentX?: number, currentY?: number) {
    const pts = fixedPoints.current;
    if (pts.length === 0) {
      pathRef.current?.setNativeProps({ d: '' });
      return;
    }

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    if (currentX !== undefined && currentY !== undefined) {
      d += ` L ${currentX} ${currentY}`;
    }

    const color = isError.current ? COLORS.ACCENT_RED : COLORS.ACCENT_TEAL;

    pathRef.current?.setNativeProps({ d, stroke: color });
  }

  return (
    // pointerEvents="none" — line does not intercept user touches
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path
        ref={pathRef}
        stroke={COLORS.ACCENT_TEAL}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.85}
      />
    </Svg>
  );
});
