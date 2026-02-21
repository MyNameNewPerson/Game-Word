import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { SPACING, SIZES } from '../../constants/sizes';

export type ToastType = 'info' | 'success' | 'bonus' | 'error';

export interface ToastRef {
  show: (message: string, type?: ToastType) => void;
}

const TOAST_COLORS = {
  info: COLORS.BG_ELEVATED,
  success: '#27AE60', // Darker green for bg
  bonus: '#8E44AD',   // Darker purple
  error: '#C0392B',   // Darker red
};

export const Toast = forwardRef((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const translateY = React.useRef(new Animated.Value(40)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show: (msg: string, toastType: ToastType = 'info') => {
      setMessage(msg);
      setType(toastType);

      // Reset
      translateY.setValue(40);
      opacity.setValue(0);

      Animated.sequence([
        // Enter
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Wait
        Animated.delay(1500),
        // Exit
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    },
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: TOAST_COLORS[type], opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: SIZES.BORDER_RADIUS,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
});
