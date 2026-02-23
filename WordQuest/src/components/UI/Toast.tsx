import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withTiming, withSequence, useAnimatedStyle, runOnJS
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export type ToastType = 'info' | 'success' | 'bonus' | 'error';

export interface ToastHandle {
  show: (message: string, type: ToastType) => void;
}

const TYPE_STYLES: Record<ToastType, { bg: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(42,42,62,0.95)',   color: COLORS.TEXT_PRIMARY,  icon: '✦' },
  success: { bg: 'rgba(107,203,119,0.2)', color: COLORS.ACCENT_GREEN,  icon: '✓' },
  bonus:   { bg: 'rgba(255,215,0,0.2)',   color: COLORS.ACCENT_GOLD,   icon: '🪙' },
  error:   { bg: 'rgba(255,107,107,0.2)', color: COLORS.ACCENT_RED,    icon: '✗' },
};

export const Toast = forwardRef<ToastHandle>((_, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show(msg, t) {
      // Отменяем предыдущий таймер если есть
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setType(t);

      // Появление
      translateY.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Исчезновение через 1800ms
      timerRef.current = setTimeout(() => {
        translateY.value = withTiming(-60, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
      }, 1800);
    },
  }));

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const { bg, color, icon } = TYPE_STYLES[type];

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg }, animStyle]}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  icon: { fontSize: FONT_SIZES.MD },
  text: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
  },
});
