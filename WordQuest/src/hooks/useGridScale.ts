import { useState, useCallback } from 'react';
import { LayoutChangeEvent, ViewStyle } from 'react-native';
import { SIZES, SPACING } from '../constants/sizes';

interface GridScaleResult {
  cellSize: number;
  containerStyle: ViewStyle;
  onLayout: (event: LayoutChangeEvent) => void;
}

export const useGridScale = (rows: number, cols: number): GridScaleResult => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  const availableWidth = containerSize.width - SPACING.LG * 2;
  const availableHeight = containerSize.height - SPACING.MD * 2;

  let cellSize = 0;
  if (rows > 0 && cols > 0 && availableWidth > 0 && availableHeight > 0) {
    const byWidth = availableWidth / cols;
    const byHeight = availableHeight / rows;
    cellSize = Math.max(SIZES.CELL_MIN, Math.min(SIZES.CELL_MAX, byWidth, byHeight));
  }

  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
  };

  return {
    cellSize,
    containerStyle,
    onLayout,
  };
};
