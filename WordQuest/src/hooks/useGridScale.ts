import { useState, useCallback } from 'react';
import { LayoutChangeEvent, ViewStyle } from 'react-native';
import { SPACING, SIZES } from '../constants/sizes';

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

  let cellSize: number = SIZES.CELL_MIN;

  if (containerSize.width > 0 && containerSize.height > 0 && rows > 0 && cols > 0) {
    const availableWidth = containerSize.width - SPACING.LG * 2; // Horizontal padding
    const availableHeight = containerSize.height - SPACING.MD * 2; // Vertical padding

    const byWidth = availableWidth / cols;
    const byHeight = availableHeight / rows;

    cellSize = Math.max(
      SIZES.CELL_MIN,
      Math.min(SIZES.CELL_MAX, byWidth, byHeight)
    );
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  };

  return { cellSize, containerStyle, onLayout };
};
