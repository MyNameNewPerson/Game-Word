import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { AdManager } from '../../services/AdManager';
import { IAPManager, PRODUCT_IDS } from '../../services/IAPManager';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const PiggyBankModal: React.FC<Props> = ({ visible, onClose }) => {
  const piggyBank = usePlayerStore(s => s.piggyBank);
  const addCoins = usePlayerStore(s => s.addCoins);
  const resetPiggyBank = usePlayerStore(s => s.resetPiggyBank);

  const handleWatchAd = async () => {
    const earned = await AdManager.showRewarded();
    if (earned) {
      addCoins(piggyBank);
      resetPiggyBank();
      onClose();
    }
  };

  const handleBuy = async () => {
    await IAPManager.purchase(PRODUCT_IDS.PIGGY_BANK);
    onClose();
  };

  const progress = Math.min(piggyBank / 1000, 1);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🐷</Text>
          <Text style={styles.title}>Копилка</Text>
          <Text style={styles.amount}>Накоплено: {piggyBank} 🪙</Text>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
          <Text style={styles.hint}>Пополняется +2 за каждое слово · Макс. 1000</Text>

          <TouchableOpacity style={styles.watchButton} onPress={handleWatchAd}>
            <Text style={styles.watchText}>▶ Смотреть видео бесплатно</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
            <Text style={styles.buyText}>
              💰 Открыть за {IAPManager.getPrice(PRODUCT_IDS.PIGGY_BANK)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center', alignItems: 'center', padding: SPACING.LG,
  },
  card: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.ACCENT_GOLD,
    padding: SPACING.XL, width: '100%', maxWidth: 340, alignItems: 'center',
  },
  emoji: { fontSize: 56, marginBottom: SPACING.SM },
  title: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.XL, color: COLORS.TEXT_PRIMARY, marginBottom: SPACING.SM },
  amount: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.LG, color: COLORS.ACCENT_GOLD, marginBottom: SPACING.MD },
  progressBg: {
    width: '100%', height: 8, backgroundColor: COLORS.GRID_EMPTY,
    borderRadius: 4, flexDirection: 'row', overflow: 'hidden', marginBottom: SPACING.XS,
  },
  progressFill: { backgroundColor: COLORS.ACCENT_GOLD },
  hint: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.SM, color: COLORS.TEXT_SECONDARY, marginBottom: SPACING.LG },
  watchButton: {
    borderWidth: 1, borderColor: COLORS.ACCENT_TEAL,
    borderRadius: SIZES.BORDER_RADIUS, paddingVertical: 14,
    width: '100%', alignItems: 'center', marginBottom: SPACING.SM,
  },
  watchText: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.MD, color: COLORS.ACCENT_TEAL },
  buyButton: {
    backgroundColor: COLORS.ACCENT_GOLD, borderRadius: SIZES.BORDER_RADIUS,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: SPACING.MD,
  },
  buyText: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.MD, color: COLORS.BG_DARK },
  closeButton: { paddingVertical: SPACING.SM },
  closeText: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.SM, color: COLORS.TEXT_SECONDARY },
});
