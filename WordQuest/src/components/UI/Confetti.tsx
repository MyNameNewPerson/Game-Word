import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, withTiming, withDelay, withSequence,
  useAnimatedStyle, Easing
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

const { width: SW, height: SH } = Dimensions.get('window');

const PARTICLE_COLORS = [
  COLORS.ACCENT_GOLD, COLORS.ACCENT_TEAL, '#FF6B9D', '#A8E6CF', '#FFD3B6'
];

interface ParticleProps {
  startX: number;
  delay: number;
  duration: number;
  driftX: number;
  color: string;
  rotation: number;
}

const ConfettiParticle: React.FC<ParticleProps> = ({
  startX, delay, duration, driftX, color, rotation
}) => {
  const y = useSharedValue(-20);
  const x = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    y.value = withDelay(delay, withTiming(SH + 20, { duration, easing: Easing.linear }));
    x.value = withDelay(delay, withTiming(startX + driftX, { duration }));
    rotate.value = withDelay(delay, withTiming(rotation, { duration }));
    // Fade out в конце
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color, left: 0, top: 0 },
        style,
      ]}
    />
  );
};

// Генерируем 40 частиц один раз
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  startX: Math.random() * SW,
  delay: Math.random() * 600,
  duration: 1500 + Math.random() * 1000,
  driftX: (Math.random() - 0.5) * 120,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  rotation: Math.random() * 720 - 360,
}));

interface Props {
  visible: boolean;
}

export const Confetti: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map(p => <ConfettiParticle key={p.id} {...p} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
