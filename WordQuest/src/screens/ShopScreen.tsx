import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import NetInfo from '@react-native-community/netinfo';
import { MysticBackground } from '../components/Background/MysticBackground';
import { IAPManager, PRODUCT_IDS } from '../services/IAPManager';
import { usePlayerStore } from '../store/playerStore';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const COIN_PRODUCTS = [
  { id: PRODUCT_IDS.COINS_500,  label: '🪙 500 монет',  badge: null         },
  { id: PRODUCT_IDS.COINS_1200, label: '🪙 1200 монет', badge: 'ПОПУЛЯРНО'  },
  { id: PRODUCT_IDS.COINS_3000, label: '🪙 3000 монет', badge: null         },
  { id: PRODUCT_IDS.COINS_8000, label: '🪙 8000 монет', badge: 'ЛУЧШАЯ ЦЕНА'},
] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export const ShopScreen: React.FC<Props> = ({ navigation }) => {
  const piggyBank = usePlayerStore(s => s.piggyBank);
  const hasNoAds = usePlayerStore(s => s.hasNoAds);

  const handlePurchase = async (productId: any) => {
    // Проверяем интернет перед покупкой (NetInfo requires installation if used)
    // const state = await NetInfo.fetch();
    // if (!state.isConnected) {
    //   Alert.alert('Нет соединения', 'Для покупки необходим интернет.');
    //   return;
    // }
    await IAPManager.purchase(productId);
  };

  return (
    <MysticBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏪 Магазин</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Монеты */}
          <Text style={styles.section}>💰 Монеты</Text>
          {COIN_PRODUCTS.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productRow}
              onPress={() => handlePurchase(product.id)}
              activeOpacity={0.7}
            >
              <View style={styles.productLeft}>
                <Text style={styles.productLabel}>{product.label}</Text>
                {product.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{product.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.price}>{IAPManager.getPrice(product.id)}</Text>
            </TouchableOpacity>
          ))}

          {/* Копилка */}
          <Text style={styles.section}>🐷 Копилка</Text>
          <View style={styles.piggyCard}>
            <Text style={styles.piggyInfo}>Накоплено: {piggyBank} из 1000 монет</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { flex: piggyBank / 1000 }]} />
              <View style={{ flex: 1 - piggyBank / 1000 }} />
            </View>
            <TouchableOpacity
              style={[styles.productRow, { marginTop: SPACING.SM }]}
              onPress={() => handlePurchase(PRODUCT_IDS.PIGGY_BANK)}
            >
              <Text style={styles.productLabel}>Открыть и получить монеты</Text>
              <Text style={styles.price}>{IAPManager.getPrice(PRODUCT_IDS.PIGGY_BANK)}</Text>
            </TouchableOpacity>
          </View>

          {/* Без рекламы */}
          {!hasNoAds && (
            <>
              <Text style={styles.section}>🚫 Убрать рекламу</Text>
              <TouchableOpacity
                style={styles.productRow}
                onPress={() => handlePurchase(PRODUCT_IDS.REMOVE_ADS)}
              >
                <Text style={styles.productLabel}>Навсегда убрать рекламу</Text>
                <Text style={styles.price}>{IAPManager.getPrice(PRODUCT_IDS.REMOVE_ADS)}</Text>
              </TouchableOpacity>
            </>
          )}
          {hasNoAds && (
            <View style={styles.noAdsActive}>
              <Text style={styles.noAdsText}>✅ Реклама отключена</Text>
            </View>
          )}

          {/* Восстановить покупки */}
          <TouchableOpacity style={styles.restoreButton}>
            <Text style={styles.restoreText}>↺ Восстановить покупки</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG, paddingVertical: SPACING.MD,
  },
  backText: { color: COLORS.TEXT_SECONDARY, fontSize: FONT_SIZES.MD, fontFamily: 'CrimsonText-Regular' },
  title: { color: COLORS.TEXT_PRIMARY, fontSize: FONT_SIZES.XL, fontFamily: 'Cinzel-Bold' },
  scroll: { padding: SPACING.LG, gap: SPACING.XS },
  section: {
    fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY, marginTop: SPACING.LG, marginBottom: SPACING.SM,
    letterSpacing: 1,
  },
  productRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A1A28', borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1, borderColor: COLORS.GRID_BORDER,
    paddingHorizontal: SPACING.MD, paddingVertical: 14, marginBottom: SPACING.XS,
  },
  productLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  productLabel: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.MD, color: COLORS.TEXT_PRIMARY },
  price: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.MD, color: COLORS.ACCENT_GOLD },
  badge: {
    backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 4,
    paddingHorizontal: SPACING.XS, paddingVertical: 2,
  },
  badgeText: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.XS, color: COLORS.ACCENT_GOLD },
  piggyCard: {
    backgroundColor: '#1A1A28', borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1, borderColor: COLORS.GRID_BORDER, padding: SPACING.MD,
  },
  piggyInfo: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.MD, color: COLORS.TEXT_SECONDARY, marginBottom: SPACING.SM },
  progressBg: {
    height: 6, backgroundColor: COLORS.GRID_EMPTY, borderRadius: 3,
    flexDirection: 'row', overflow: 'hidden', marginBottom: SPACING.SM,
  },
  progressFill: { backgroundColor: COLORS.ACCENT_GOLD },
  noAdsActive: {
    backgroundColor: 'rgba(107,203,119,0.15)', borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1, borderColor: COLORS.ACCENT_GREEN,
    padding: SPACING.MD, alignItems: 'center', marginTop: SPACING.LG,
  },
  noAdsText: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.MD, color: COLORS.ACCENT_GREEN },
  restoreButton: { alignItems: 'center', paddingVertical: SPACING.XL, marginTop: SPACING.MD },
  restoreText: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.SM, color: COLORS.TEXT_SECONDARY },
});
