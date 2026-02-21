import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { usePlayerStore } from '../../store/playerStore';

const CoinCounter = () => {
  const coins = usePlayerStore((state) => state.coins);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🪙</Text>
      <Text style={styles.amount}>{coins}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
    color: COLORS.ACCENT_GOLD,
  },
  amount: {
    fontFamily: FONTS.NUMBERS_BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.ACCENT_GOLD,
  },
});

export default React.memo(CoinCounter);
