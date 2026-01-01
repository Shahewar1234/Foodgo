
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
//import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import Slider from '@react-native-community/slider';
// app theme + images
import colors from '../theme/colors';
import Images from '../constants/images';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../stores/AuthContext';

type Nav = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

// Mock toppings/side options (use your real images from Images.*)
const TOPPINGS = [
  { id: 't1', name: 'Tomato',     img: Images.toppingTomato,     price: 0.5 },
  { id: 't2', name: 'Onions',     img: Images.toppingOnion,      price: 0.4 },
  { id: 't3', name: 'Pickles',    img: Images.toppingPickles,     price: 0.6 },
  { id: 't4', name: 'Bacons',     img: Images.toppingBacon,      price: 1.2 },
];

const SIDES = [
  { id: 's1', name: 'Fries',      img: Images.sideFries,         price: 1.8 },
  { id: 's2', name: 'Coleslaw',   img: Images.sideColeslaw,      price: 1.5 },
  { id: 's3', name: 'Salad',      img: Images.sideSalad,         price: 1.6 },
  { id: 's4', name: 'Onion',      img: Images.sideOnionRings,    price: 1.7 },
];

// base price for the selected burger (pass via route.params if you have product object)
const BASE_PRICE = 14.99;

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [spicy, setSpicy] = useState<number>(0.5); // 0..1
  const [portion, setPortion] = useState<number>(2); // count
  const [pickedToppings, setPickedToppings] = useState<string[]>([]);
  const [pickedSides, setPickedSides] = useState<string[]>([]);

  // Get currency symbol from user, default to USD
  const currencySymbol = user?.currency?.symbol || '$';

  const totalPrice = useMemo(() => {
    const toppingsTotal = TOPPINGS
      .filter(t => pickedToppings.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);

    const sidesTotal = SIDES
      .filter(s => pickedSides.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);

    // portion scales base price (e.g., 2 patties etc.)
    const portionMultiplier = 0.6 + portion * 0.2; // feel-good curve
    const spicyAdj = spicy * 0.2; // tiny price variance for spicy customization

    const total = (BASE_PRICE * portionMultiplier + toppingsTotal + sidesTotal + spicyAdj);
    return Math.max(total, 0).toFixed(2);
  }, [spicy, portion, pickedToppings, pickedSides]);

  const togglePick = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  return (
    <View style={[styles.container, styles.safeTop]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero row: burger stack (left) + copy & controls (right) */}
        <View style={styles.heroRow}>
          <Image source={Images.burgerStack} style={styles.heroImage} resizeMode="contain" />
          <View style={styles.heroRight}>
            <Text style={styles.heroTitle}>
              <Text style={styles.heroTitleBold}>Customize </Text>
              Your Burger to Your Tastes. Ultimate Experience.
            </Text>

            {/* Spicy */}
            <View style={styles.spicyBlock}>
              <Text style={styles.spicyLabel}>Spicy</Text>
              <Slider
                style={styles.spicySlider}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={spicy}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E5E5E5"
                thumbTintColor={colors.primary}
                onValueChange={setSpicy}
              />
              <View style={styles.spicyScale}>
                <Text style={styles.spicyScaleTextGreen}>Mild</Text>
                <Text style={styles.spicyScaleTextRed}>Hot</Text>
              </View>
            </View>

            {/* Portion */}
            <View style={styles.portionRow} pointerEvents="box-none">
              <Text style={styles.portionLabel}>Portion</Text>
              <View style={styles.stepper} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.stepBtnMinus}
                  onPress={() => setPortion(p => Math.max(1, p - 1))}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>

                <View style={styles.stepCount}>
                  <Text style={styles.stepCountText}>{portion}</Text>
                </View>

                <TouchableOpacity
                  style={styles.stepBtnPlus}
                  onPress={() => setPortion(p => Math.min(5, p + 1))}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Toppings */}
        <Text style={styles.sectionTitle}>Toppings</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.cardRow}
          showsHorizontalScrollIndicator={false}
        >
          {TOPPINGS.map(t => {
            const active = pickedToppings.includes(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.itemCard, active && styles.itemCardActive]}
                activeOpacity={0.9}
                onPress={() => togglePick(t.id, pickedToppings, setPickedToppings)}
              >
                <Image source={t.img} style={styles.itemImg} resizeMode="contain" />
                <View style={styles.itemLabelRow}>
                  <Text style={styles.itemLabel}>{t.name}</Text>
                  <View style={[styles.plusBadge, active && styles.plusBadgeActive]}>
                    <Ionicons name="add" size={14} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Side options */}
        <Text style={styles.sectionTitle}>Side options</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.cardRow}
          showsHorizontalScrollIndicator={false}
        >
          {SIDES.map(s => {
            const active = pickedSides.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.itemCard, active && styles.itemCardActive]}
                activeOpacity={0.9}
                onPress={() => togglePick(s.id, pickedSides, setPickedSides)}
              >
                <Image source={s.img} style={styles.itemImg} resizeMode="contain" />
                <View style={styles.itemLabelRow}>
                  <Text style={styles.itemLabel}>{s.name}</Text>
                  <View style={[styles.plusBadge, active && styles.plusBadgeActive]}>
                    <Ionicons name="add" size={14} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Total + Order now */}
        <View style={styles.ctaRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{currencySymbol}{totalPrice}</Text>
          </View>

          <TouchableOpacity
            style={styles.orderBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Payment', { order: { productId: 'unknown', name: 'Custom Burger', total: `${currencySymbol}${totalPrice}` } })}
          >
            <Text style={styles.orderText}>ORDER NOW</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ===== Styles ===== */
const TOP_PAD_ANDROID = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeTop: { paddingTop: Platform.OS === 'android' ? TOP_PAD_ANDROID + 6 : 6 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 6,
    justifyContent: 'space-between',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  iconBtn: { padding: 8 },

  content: { paddingBottom: 24 },

  // Hero row
  heroRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  heroImage: {
    width: '42%',
    height: 280,
  },
  heroRight: {
    flex: 1,
    paddingLeft: 16,
  },
  heroTitle: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Spicy
  spicyBlock: { marginBottom: 12 },
  spicyLabel: { fontSize: 13, color: colors.text, marginBottom: 8, fontWeight: '600' },
  spicySlider: { width: '100%', height: 32 },
  spicyScale: { flexDirection: 'row', justifyContent: 'space-between' },
  spicyScaleTextGreen: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  spicyScaleTextRed: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  heroTitleBold: { fontWeight: '700' },
  stepBtnWhite: { backgroundColor: '#fff' },
  stepBtnPrimary: { backgroundColor: colors.primary },
  portionRow: { marginTop: 8 },
  portionLabel: { fontSize: 13, color: colors.text, marginBottom: 8, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  stepBtnMinus: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  stepBtnPlus: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  stepCount: {
    width: 56, height: 44, borderRadius: 14,
    marginHorizontal: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e5e5e5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  stepCountText: { fontSize: 16, fontWeight: '700', color: colors.text },

  // Cards list
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    marginTop: 12, marginBottom: 8, paddingHorizontal: 16,
  },
  cardRow: { paddingHorizontal: 12 },
  itemCard: {
    width: 110, height: 110, borderRadius: 16, backgroundColor: '#fff',
    marginRight: 12, padding: 10,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  itemCardActive: {
    borderColor: colors.primary,
  },
  itemImg: { width: '100%', height: 60 },
  itemLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  itemLabel: { fontSize: 12, color: colors.text, fontWeight: '600' },
  plusBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#999',
    alignItems: 'center', justifyContent: 'center',
  },
  plusBadgeActive: { backgroundColor: colors.primary },

  // CTA row
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 30,
  },
  totalBox: { flex: 1 },
  totalLabel: { fontSize: 14, color: colors.muted },
  totalPrice: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 6 },
  orderBtn: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  orderText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
  