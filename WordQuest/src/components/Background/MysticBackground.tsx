import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

const { width: SW, height: SH } = Dimensions.get('window');

// Одна плавающая частица
interface ParticleProps {
  startX: number;
  startY: number;
  duration: number;    // 8000–15000ms
  color: string;
  size: number;        // 2–4px
}

const Particle: React.FC<ParticleProps> = ({ startX, startY, duration, color, size }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-SH - 50, { duration, easing: Easing.linear }),
      -1,   // бесконечно
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.2,
      }, style]}
    />
  );
};

// Генерируем частицы один раз — при монтировании компонента
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  startX: Math.random() * SW,
  startY: Math.random() * SH,
  duration: 8000 + Math.random() * 7000,
  color: i % 2 === 0 ? COLORS.ACCENT_TEAL : COLORS.ACCENT_GOLD,
  size: 2 + Math.random() * 2,
}));

interface Props {
  children: React.ReactNode;
}

export const MysticBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Частицы */}
      {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
      {/* Контент */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
  },
});
