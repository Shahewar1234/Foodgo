import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Slider from '@react-native-community/slider';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import colors from '../theme/colors';
import { StatusBar } from 'react-native';
import { useAuth } from '../stores/AuthContext';

type DetailRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

function parsePriceToNumber(priceStr: string) {
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// Optional per-category copy matching your style
function getDescription(name: string, category: string) {
  const title = `${name} ${category}`;
  switch (category) {
    case "Wendy's Burger":
      return `The ${title} is a classic fast food burger that packs a punch of flavor in every bite. Made with a juicy beef patty cooked to perfection, it's topped with melted American cheese, crispy lettuce, ripe tomato, and crunchy pickles.`;
    case 'Veggie Burger':
      return `The ${title} is a wholesome plant-forward stack—crispy lettuce, ripe tomato, zesty onions, and a seasoned veggie patty, delivering a fresh bite with every mouthful.`;
    case 'Chicken Burger':
      return `The ${title} features a tender, seasoned chicken patty layered with lettuce and tomato—light, satisfying, and perfect for a quick meal.`;
    case 'Fried Chicken Burger':
      return `The ${title} piles up a crispy fried chicken fillet with cool lettuce and creamy mayo for an irresistible crunch and comfort.`;
    default:
      return `Enjoy the ${title}—balanced flavors, fresh ingredients, and a satisfying bite every time.`;
  }
}

export default function ProductDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { product } = route.params;
  const { user } = useAuth();

  const [spice, setSpice] = React.useState(0.25); // 0..1
  const [portion, setPortion] = React.useState(1); // start at 1 

  const unitPrice = parsePriceToNumber(product.price);
  const totalPrice = (unitPrice * portion).toFixed(2);
  
  // Get currency symbol from user, default to USD
  const currencySymbol = user?.currency?.symbol || '$';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top actions */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero image */}
        <Image source={product.image} style={styles.heroImage} resizeMode="contain" />

        {/* Title + meta */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.name} {product.category}</Text>

          <View style={styles.metaRow}>
            <Icon name="star" size={14} color="#FFA500" />
            <Text style={styles.metaText}> {product.rating.toFixed(1)}  —  26 mins</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{getDescription(product.name, product.category)}</Text>

          {/* Controls */}
          <View style={styles.controlsBlock}>
            {/* Spicy */}
            <Text style={styles.controlLabel}>Spicy</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={spice}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#EAEAEA"
              thumbTintColor={colors.primary}
              step={0.01}
              onValueChange={setSpice}
            />
            <View style={styles.spiceLabels}>
              <Text style={[styles.spiceLabel, styles.spiceLabelMild]}>Mild</Text>
              <Text style={[styles.spiceLabel, styles.spiceLabelHot]}>Hot</Text>
            </View>
 
            {/* Portion */}
            <View style={[styles.portionRow, styles.portionRowMargin]}>
              <Text style={styles.controlLabel}>Portion</Text>
              <View style={styles.portionStepper}>
                <TouchableOpacity
                  style={styles.stepBtn}  
                  onPress={() => setPortion(p => Math.max(1, p - 1))}
                  activeOpacity={0.85}
                >
                  <Icon name="minus" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.portionQty}>{portion}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setPortion(p => Math.min(9, p + 1))}
                  activeOpacity={0.85}
                >
                  <Icon name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.bottomCtas}>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{currencySymbol}{totalPrice}</Text>
        </View>
          <TouchableOpacity
            style={styles.orderBtn}
            activeOpacity={0.9}
            onPress={() => {
              navigation.navigate('Payment', {
                order: { productId: 'unknown', name: `${product.name} ${product.category}`, total: `${currencySymbol}${totalPrice}` },
              });
            }}
          >
          <Text style={styles.orderText}>ORDER NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },

  heroImage: {
    width: '100%',
    height: 350,
    alignSelf: 'center',
    marginTop: 8,
  },

  content: { paddingHorizontal: 16, paddingTop: 12 },
  scrollContent: { paddingBottom: 24 },

  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { fontSize: 14, color: colors.muted, marginLeft: 6 },

  description: { fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 4 },

  controlsBlock: { marginTop: 18 },

  slider: { width: '100%', height: 32 },

  controlLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },

  spiceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  spiceLabel: { fontSize: 12 },
  spiceLabelMild: { color: '#16A34A', fontWeight: '600' },
  spiceLabelHot: { color: '#EF4444', fontWeight: '600' },

  portionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  portionRowMargin: { marginTop: 8 },
  portionStepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3,
  },
  portionQty: { fontSize: 16, fontWeight: '700', color: colors.text, marginHorizontal: 12 },

  bottomCtas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
  },
  pricePill: {
    minWidth: 100,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  priceText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  orderBtn: {
    flex: 1, height: 52, marginLeft: 12,
    borderRadius: 18,
    backgroundColor: '#2C2C2C',
    alignItems: 'center', justifyContent: 'center',
  },
  orderText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
