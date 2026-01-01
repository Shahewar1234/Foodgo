import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { RootStackParamList } from '../navigation/RootNavigator';
import colors from '../theme/colors';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ route, navigation }: Props) {
  const { favorites = [], products = [] } = route.params || {};

  const favoriteProducts = products.filter((p: any) => favorites.includes(p.id));

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.footer}>
        <Ionicons name="star" size={14} color="#FFA500" />
        <Text style={styles.rating}> {item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      <View style={styles.header} >
        <Text style={styles.title}>Favorites</Text>
        <View style={styles.spacer} />
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyText}>No favorites yet</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginTop: 50,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text , alignItems: 'center'},
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.muted, marginTop: 12 },
  list: { paddingHorizontal: 20, paddingVertical: 16 },
  row: { justifyContent: 'space-between', marginBottom: 14 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 10 },
  image: { width: '100%', height: 130, marginBottom: 14 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 6 },
  category: { fontSize: 13, color: colors.muted, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  rating: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 4 },
  spacer: { width: 24 },
});
