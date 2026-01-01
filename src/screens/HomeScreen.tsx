import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@react-native-vector-icons/ionicons'
import colors from '../theme/colors';
import Images, { imageByName } from '../constants/images';
import extraProducts from '../constants/products.json';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../stores/AuthContext';

// ---------- Data ----------
const CATEGORIES = ['All', 'Combos', 'Noodles', 'Classics'] as const;
type Category = typeof CATEGORIES[number];

const localProducts = [
  { id: '1', name: 'Cheeseburger', category: "Wendy's Burger", price: '$8.24', rating: 4.9, image: Images.burger3 },
  { id: '2', name: 'Hamburger',   category: 'Veggie Burger',   price: '$9.44', rating: 4.8, image: Images.burger2 },
  { id: '3', name: 'Hamburger',   category: 'Chicken Burger',  price: '$7.48', rating: 4.6, image: Images.burger4 },
  { id: '4', name: 'Hamburger',   category: 'Fried Chicken Burger', price: '$9.99', rating: 4.5, image: Images.burger5 },
  { id: '5', name: 'Premium Deluxe', category: 'Gourmet Burger', price: '$16.49', rating: 4.7, image: Images.burger1 },
  { id: '6', name: 'Burger Stack', category: 'Premium Stack', price: '$18.99', rating: 4.8, image: Images.burgerStack },
];

// Map extraProducts (from products.json) to same shape.
const mappedExtra = (extraProducts as any[]).map((p) => ({
  id: String(p.id),
  name: p.name,
  category: p.category,
  price: p.price,
  rating: p.rating || 0,
  image: imageByName(p.image),
}));

export const PRODUCTS = [...localProducts, ...mappedExtra];

// ---------- Bottom bar / notch constants ----------
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_HEIGHT = 110;
const SIDE_RADIUS = 32;
const NOTCH_DIAMETER = 92;
const NOTCH_RADIUS = NOTCH_DIAMETER / 2;

const ICON_COLOR = '#FFFFFF';
const ICON_SIZE = 30;

type Product = typeof PRODUCTS[number];
type Nav = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

// ---------- Category matchers (includes “Family Pack” for Combos) ----------
const categoryMatchers: Record<Category, (p: Product) => boolean> = {
  All: () => true,
  Combos: (p) =>
    /combo|family\s*pack/i.test(p.category || '') ||
    /combo|family\s*pack/i.test(p.name || ''),
  Noodles: (p) =>
    /noodle/i.test(p.category || '') ||
    /noodle/i.test(p.name || ''),
  Classics: (p) =>
    /burger|hamburger|cheeseburger/i.test(p.category || '') ||
    /burger|hamburger|cheeseburger/i.test(p.name || ''),
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = React.useState<Category>('All');
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);

  // Get currency symbol from user, default to USD
  const currencySymbol = user?.currency?.symbol || '$';

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ✅ Filtered list (category + search)
  const filteredProducts = React.useMemo(() => {
    const matchByCategory = categoryMatchers[selectedCategory] || categoryMatchers.All;
    const q = search.trim().toLowerCase();

    return PRODUCTS.filter(p => {
      if (!matchByCategory(p)) return false;
      if (!q) return true;
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [selectedCategory, search]);

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        if (item.id === '6') {
          navigation.navigate('ProductDetail2' as any, { product: item } as any);
        } else {
          navigation.navigate('ProductDetail' as any, { product: item } as any);
        }
      }}
    >
      <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardCategory}>{item.category}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFA500" />
          <Text style={styles.rating}> {Number(item.rating || 0).toFixed(1)}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={favorites.includes(item.id) ? colors.primary : '#999'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.price}>
        {currencySymbol}
        {String(item.price).replace(/[^\d.]/g, '')}
      </Text>
    </TouchableOpacity>
  );

  // ---------- Menu handlers ----------
  const closeMenu = () => setMenuVisible(false);

  const onMenuSelect = (key: 'home' | 'profile' | 'favourite' | 'support') => {
    closeMenu();
    switch (key) {
      case 'home':
        navigation.navigate('Home' as any);
        break;
      case 'profile':
        navigation.navigate('Profile' as any);
        break;
      case 'favourite':  
        navigation.navigate('Favorites' as any);
        break;
      case 'support':
        // If you have Support route use it; otherwise fallback to Chat
        navigation.navigate('Chat' as any);
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, styles.safeTop]}>
      {/* ✅ Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>Food</Text>
              <Text style={styles.logoTextAccent}>go</Text>
            </View>
            <Text style={styles.subtitle}>Order your favourite food!</Text>
          </View>

          {/* Rounded profile avatar */}
          <TouchableOpacity
            style={styles.profileCircle}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <Image source={Images.avatarPlaceholder} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Search + Menu (three lines) */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#A0A0A0"
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#A0A0A0" />
              </TouchableOpacity>
            )}
          </View>

          {/* Three lines (hamburger) menu button */}
          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.85}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.9}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productListContent}
          ListEmptyComponent={
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 16 }}>
                No items found. Try a different category or search.
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* Bottom navigation with concave notch */}
      <View style={styles.bottomNav}>
        {/* Left group */}
        <View style={styles.group}>
          <View style={styles.iconWrap}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Ionicons name="home" size={ICON_SIZE} color={ICON_COLOR} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <Ionicons name="person" size={ICON_SIZE} color={ICON_COLOR} />
          </TouchableOpacity>
        </View>

        {/* Center gap reserved for notch/FAB */}
        <View style={styles.centerGap} />

        {/* Right group */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Chat' as any)}
          >
            <Ionicons name="chatbubble-ellipses" size={ICON_SIZE} color={ICON_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Favorites' as any, { favorites, products: PRODUCTS } as any)
            }
          >
            <Ionicons name="heart" size={ICON_SIZE} color={ICON_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* FAB centered in the notch */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.9}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ---------- Simple menu modal ---------- */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          {/* Click-through area; box will not close if you tap inside it */}
        </Pressable>

        {/* Menu card (top-right) */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => onMenuSelect('home')}>
            <Ionicons name="home" size={18} color={colors.text} />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => onMenuSelect('profile')}>
            <Ionicons name="person" size={18} color={colors.text} />
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => onMenuSelect('favourite')}>
            <Ionicons name="heart" size={18} color={colors.text} />
            <Text style={styles.menuText}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => onMenuSelect('support')}>
            <Ionicons name="help-buoy" size={18} color={colors.text} />
            <Text style={styles.menuText}>Support</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* ===== Styles ===== */
const TOP_PAD_ANDROID = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: '#fff' },
  safeTop: { paddingTop: Platform.OS === 'android' ? TOP_PAD_ANDROID + 8 : 8 },
  pageContent: { paddingBottom: 180 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 6 },

  // Logo (Food + go accent)
  logoRow: { flexDirection: 'row', alignItems: 'flex-end' },
  logoText: {
    fontSize: 34,
    color: colors.text,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -0.6,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoTextAccent: {
    fontSize: 34,
    color: colors.primary,
    fontWeight: '800',
    fontStyle: 'italic',
    marginLeft: 2,
    letterSpacing: -0.6,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  input: { flex: 1, fontSize: 16, color: colors.text },
  searchIcon: { marginRight: 8 },

  // Menu (three lines) button
  menuButton: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 10,
  },

  // Chips
  categories: { paddingHorizontal: 20 },
  categoriesContent: { alignItems: 'center', paddingVertical: 10 },
  categoryButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10
  },
  categoryText: { fontSize: 15, color: colors.muted, fontWeight: '700' },
  categoryTextActive: { color: '#fff', fontWeight: '800' },

  // Product cards
  row: { justifyContent: 'space-between', marginBottom: 14 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  cardImage: { width: '100%', height: 130, marginBottom: 14 },
  cardName: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 6 },
  cardCategory: { fontSize: 13, color: colors.muted, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 14, fontWeight: '600', color: colors.text },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary, marginTop: 10 },

  // Bottom nav (concave with notch)
  bottomNav: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: BAR_HEIGHT,
    backgroundColor: colors.primary,
    borderTopLeftRadius: SIDE_RADIUS,
    borderTopRightRadius: SIDE_RADIUS,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 26 : 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 16,
  },
  notch: {
    position: 'absolute',
    top: -NOTCH_RADIUS,
    left: SCREEN_WIDTH / 2 - NOTCH_RADIUS,
    width: NOTCH_DIAMETER,
    height: NOTCH_DIAMETER,
    borderRadius: NOTCH_RADIUS,
    backgroundColor: '#fff',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 10,
  },
  group: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 8,
    zIndex: 2,
  },
  iconBtn: { padding: 10 },
  centerGap: { width: NOTCH_DIAMETER * 0.92 },

  // FAB in notch
  fabWrapper: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: BAR_HEIGHT - NOTCH_RADIUS - 4,
    alignItems: 'center',
    zIndex: 5,
  },
  fabButton: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 8, borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 20,
  },
  productListContent: { paddingHorizontal: 20, paddingTop: 26 },
  avatar: { width: 48, height: 48, borderRadius: 12 },
  iconWrap: { alignItems: 'center' },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginTop: 6,
  },

  // ---------- Menu modal styles ----------
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuCard: {
    position: 'absolute',
    top: 118, // roughly below the search bar
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuText: { marginLeft: 10, fontSize: 15, color: colors.text, fontWeight: '600' },
});

