import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import colors from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../stores/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome5';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

type CardType = 'credit' | 'debit';
type SavedCard = {
  id: string;
  brand: string;       // e.g., VISA
  number: string;      // digits only
  name: string;
  expiry: string;      // MM/YY
  type: CardType;      // credit or debit
};

export default function PaymentScreen({ route, navigation }: Props) {
  const { order } = route.params || { order: { name: 'Unknown', total: '$0.00' } };
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'debit' | 'upi' | 'cod' | 'none'>('none');

  // Saved cards + selection
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Add/Edit card form
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<CardType>('credit'); // NEW: choose Credit/Debit
  const [cardErrors, setCardErrors] = useState<{ [k: string]: string }>({});

  // Address & instructions (visible for all methods)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [payErrors, setPayErrors] = useState<{ [k: string]: string }>({});

  const storageKey = user ? `cards_${user.uid}` : `cards_guest`;

  // -------- Amount helpers --------
  const parseAmount = (s: string) => {
    const n = Number(String(s).replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const currencySymbol = (() => {
    const m = String(order.total).match(/[^0-9.\s]/);
    return m ? m[0] : '$';
  })();

  const baseTotal = parseAmount(order.total);

  // Example charges (adjust as needed)
  const deliveryCharge = 25;   // demo value
  const codFee = 10;           // only when COD
  const taxRate = 0.05;        // 5%
  const taxes = +(baseTotal * taxRate).toFixed(2);

  // Totals based on selected method
  const grandTotalCommon = +(baseTotal + deliveryCharge + taxes).toFixed(2);          // Card/Debit/UPI
  const grandTotalCOD = +(baseTotal + deliveryCharge + codFee + taxes).toFixed(2);    // Cash on Delivery
  const currentGrandTotal = selectedMethod === 'cod' ? grandTotalCOD : grandTotalCommon;

  const fmt = (n: number) => `${currencySymbol}${n.toFixed(2)}`;

  // Load saved cards
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) setCards(JSON.parse(raw));
      } catch (e) {
        console.warn('load cards err', e);
      }
    };
    load();
  }, [storageKey]);

  // Save cards
  const saveCards = async (next: SavedCard[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.warn('save cards err', e);
    }
  };

  // Filter cards by type for the current method
  const creditCards = useMemo(() => cards.filter(c => c.type === 'credit'), [cards]);
  const debitCards  = useMemo(() => cards.filter(c => c.type === 'debit'),  [cards]);

  const visibleCards = selectedMethod === 'card'
    ? creditCards
    : selectedMethod === 'debit'
      ? debitCards
      : [];

  // Ensure a selected card exists for the chosen method
  useEffect(() => {
    if (selectedMethod === 'card' || selectedMethod === 'debit') {
      const list = visibleCards;
      if (list.length > 0) {
        // If no selected card or selected card isn't in list, select the first
        if (!selectedCardId || !list.some(c => c.id === selectedCardId)) {
          setSelectedCardId(list[0].id);
        }
      } else {
        setSelectedCardId(null);
      }
    } else {
      setSelectedCardId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod, cards]);

  const selectedCard: SavedCard | null =
    selectedMethod === 'card'
      ? visibleCards.find(c => c.id === selectedCardId) || null
      : selectedMethod === 'debit'
        ? visibleCards.find(c => c.id === selectedCardId) || null
        : null;

  // Add/Edit/Delete cards
  const handleAddCard = () => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const errs: { [k: string]: string } = {};
    if (cleanNumber.length < 12) errs.cardNumber = 'Required';
    if (!cardName) errs.cardName = 'Required';
    if (expiry.length < 3) errs.expiry = 'Required';
    if (cvv.length < 3) errs.cvv = 'Required';
    if (Object.keys(errs).length > 0) { setCardErrors(errs); return; }
    const cardObj: SavedCard = {
      id: editingId || Date.now().toString(),
      brand: 'VISA',
      number: cleanNumber,
      name: cardName,
      expiry,
      type: cardType,                      // ← save type
    };

    const next = editingId ? cards.map(c => (c.id === editingId ? cardObj : c)) : [cardObj, ...cards];

    setCards(next);
    saveCards(next);

    // Reset form
    setCardNumber(''); setCardName(''); setExpiry(''); setCvv('');
    setShowAddCard(false);
    setEditingId(null);

    // Auto-select method & card panel based on type
    if (cardType === 'credit') {
      setSelectedMethod('card');
    } else {
      setSelectedMethod('debit');
    }
    setSelectedCardId(cardObj.id);
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert('Delete card', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const next = cards.filter(c => c.id !== id);
          setCards(next);
          await saveCards(next);
          if (selectedCardId === id) setSelectedCardId(null);
        },
      },
    ]);
  };

  const handleEditCard = (c: SavedCard) => {
    setEditingId(c.id);
    setCardNumber(c.number);
    setCardName(c.name);
    setExpiry(c.expiry);
    setCvv('');
    setCardType(c.type);         // reflect existing type
    setShowAddCard(true);
    setSelectedMethod(c.type === 'credit' ? 'card' : 'debit');
    setSelectedCardId(c.id);
  };

  const onPayNow = () => {
    const errs: { [k: string]: string } = {};
    if (selectedMethod === 'none') {
      errs.method = 'Required';
      Alert.alert('Please select payment mode');
    }
    if (!deliveryAddress.trim()) errs.deliveryAddress = 'Required';
    if (Object.keys(errs).length > 0) { setPayErrors(errs); return; }

    if (selectedMethod === 'cod') {
      Alert.alert(
        'Cash on Delivery',
        `You will pay ${fmt(grandTotalCOD)} on delivery.\n\nAddress:\n${deliveryAddress}\n\nInstructions:\n${deliveryInstructions || '—'}`
      );
    } else if (selectedMethod === 'card' || selectedMethod === 'debit') {
      const last4 = selectedCard ? selectedCard.number.slice(-4) : '——';
      Alert.alert(
        selectedMethod === 'card' ? 'Credit Card Payment' : 'Debit Card Payment',
        `Card: •••• ${last4}\nTotal: ${fmt(currentGrandTotal)}\n\nAddress:\n${deliveryAddress}`
      );
    } else {
      Alert.alert('Payment', `Method: ${selectedMethod.toUpperCase()}\nTotal: ${fmt(currentGrandTotal)}`);
    }

    navigation.navigate('Success');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      {/* Top bar with back */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order summary */}
        <Text style={styles.title}>Order summary</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.rowLabel}>Item</Text>
          <Text style={styles.rowValue}>{order.name}</Text>

          <View style={styles.divider} />

          <Text style={styles.rowLabel}>Total</Text>
          <Text style={[styles.rowValue, styles.total]}>{fmt(baseTotal)}</Text>
        </View>

        {payErrors.method ? <Text style={styles.errorText}>Please select payment mode</Text> : null}
        

        {/* Payment methods */}
        <Text style={styles.sub}>Payment methods</Text>

        <View style={styles.methodsRow}>
          <TouchableOpacity
            style={[styles.methodBtn, selectedMethod === 'card' && styles.methodBtnActive]}
            onPress={() => {
              setSelectedMethod('card');
              setShowAddCard(false);
            }}
          >
            <Text style={[styles.methodText, selectedMethod === 'card' && styles.methodTextActive]}>Credit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, selectedMethod === 'debit' && styles.methodBtnActive]}
            onPress={() => { setSelectedMethod('debit'); }}
          >
            <Text style={[styles.methodText, selectedMethod === 'debit' && styles.methodTextActive]}>Debit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, selectedMethod === 'cod' && styles.methodBtnActive]}
            onPress={() => { setSelectedMethod('cod'); }}
          >
            <Text style={[styles.methodText, selectedMethod === 'cod' && styles.methodTextActive]}>Cash</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- Order Details (Address + Instructions) – visible for all methods ---------- */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeaderRow}>
            <View style={styles.detailsBadge}>
              <Text style={styles.detailsBadgeText}>ORDER</Text>
            </View>
            <Text style={styles.detailsTitle}>Delivery Details</Text>
          </View>

          <Text style={[styles.inputLabel, { marginTop: 10 }]}>Delivery address</Text>
          <TextInput
            style={[styles.inputField, { minHeight: 50 }]}
            placeholder="Flat / Street / Area, City, Pincode"
            value={deliveryAddress}
            onChangeText={(t) => { setDeliveryAddress(t); setPayErrors(prev => ({ ...prev, deliveryAddress: '' })); }}
            multiline
          />
          {payErrors.deliveryAddress ? <Text style={styles.errorText}>{payErrors.deliveryAddress}</Text> : null}

          <Text style={[styles.inputLabel, { marginTop: 10 }]}>Delivery instructions (optional)</Text>
          <TextInput
            style={[styles.inputField, { minHeight: 50 }]}
            placeholder="e.g., Call on arrival, leave at door"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
          />
        </View>

        {/* Saved cards list (filtered by current method's type) */}
        {(selectedMethod === 'card' || selectedMethod === 'debit') && visibleCards.length > 0 && (
          <View style={styles.savedWrapper}>
            {visibleCards.map(c => {
              const isSelected = c.id === selectedCardId;
              return (
                <View key={c.id} style={[styles.cardVisual, isSelected && styles.cardVisualSelected]}>
                  <TouchableOpacity
                    style={styles.cardSelectArea}
                    onPress={() => {
                      setSelectedMethod(c.type === 'credit' ? 'card' : 'debit');
                      setSelectedCardId(c.id);
                    }}
                  >
                    <View style={styles.cardRow}>
                      <Text style={styles.cardBrand}>
                        {c.brand} · {c.type.toUpperCase()}
                      </Text>
                      <Text style={styles.cardNum}>•••• {c.number.slice(-4)}</Text>
                    </View>
                    <View style={styles.cardRowBelow}>
                      <Text style={styles.cardName}>{c.name}</Text>
                      <Text style={styles.cardExpiry}>{c.expiry}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Mini breakdown footer inside saved card */}
                  <View style={styles.cardMiniBreak}>
                    <View style={styles.breakRow}>
                      <Text style={styles.breakLabel}>Item</Text>
                      <Text style={styles.breakValue}>{fmt(baseTotal)}</Text>
                    </View>
                    <View style={styles.breakRow}>
                      <Text style={styles.breakLabel}>Delivery</Text>
                      <Text style={styles.breakValue}>{fmt(deliveryCharge)}</Text>
                    </View>
                    <View style={styles.breakRow}>
                      <Text style={styles.breakLabel}>Taxes (5%)</Text>
                      <Text style={styles.breakValue}>{fmt(taxes)}</Text>
                    </View>
                    <View style={styles.codDivider} />
                    <View style={styles.breakRow}>
                      <Text style={[styles.breakLabel, styles.breakTotalLabel]}>Total</Text>
                      <Text style={[styles.breakValue, styles.breakTotalValue]}>{fmt(grandTotalCommon)}</Text>
                    </View>

                    {/* Address line */}
                    {deliveryAddress?.trim().length > 0 && (
                      <Text style={styles.cardAddressLine} numberOfLines={2}>
                        {deliveryAddress}
                      </Text>
                    )}
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditCard(c)}>
                      <Text style={styles.cardActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cardActionBtn, styles.cardDeleteBtn]} onPress={() => handleDeleteCard(c.id)}>
                      <Text style={styles.cardDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Add card CTA (visible when method is Credit/Debit) */}
        {(selectedMethod === 'card' || selectedMethod === 'debit') && (
          <TouchableOpacity
            style={styles.addCardBtn}
            onPress={() => {
              setShowAddCard(true);
              // Sync cardType toggle with the selected method
              setCardType(selectedMethod === 'card' ? 'credit' : 'debit');
            }}
          >
            <Text style={styles.addCardText}>+ Add new {selectedMethod === 'card' ? 'credit' : 'debit'} card</Text>
          </TouchableOpacity>
        )}

        {/* Add card form (frontend only) */}
        {showAddCard && (selectedMethod === 'card' || selectedMethod === 'debit' || selectedMethod === 'none') && (
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Card type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, cardType === 'credit' && styles.typeBtnActive]}
                onPress={() => setCardType('credit')}
              >
                <Text style={[styles.typeText, cardType === 'credit' && styles.typeTextActive]}>Credit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, cardType === 'debit' && styles.typeBtnActive]}
                onPress={() => setCardType('debit')}
              >
                <Text style={[styles.typeText, cardType === 'debit' && styles.typeTextActive]}>Debit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Card number</Text>
            <TextInput
              style={styles.inputField}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={(t) => { setCardNumber(t); setCardErrors(prev => ({ ...prev, cardNumber: '' })); }}
            />
            {cardErrors.cardNumber ? <Text style={styles.errorText}>{cardErrors.cardNumber}</Text> : null}

            <Text style={styles.inputLabel}>Name on card</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Full name"
              value={cardName}
              onChangeText={(t) => { setCardName(t); setCardErrors(prev => ({ ...prev, cardName: '' })); }}
            />
            {cardErrors.cardName ? <Text style={styles.errorText}>{cardErrors.cardName}</Text> : null}

            <View style={styles.rowInline}>
              <View style={styles.flex2}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={(t) => { setExpiry(t); setCardErrors(prev => ({ ...prev, expiry: '' })); }}
                />
              </View>
              <View style={styles.flex1ml}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="123"
                  value={cvv}
                  onChangeText={(t) => { setCvv(t); setCardErrors(prev => ({ ...prev, cvv: '' })); }}
                  secureTextEntry
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {cardErrors.expiry ? <Text style={[styles.errorText, { alignSelf: 'flex-start' }]}>{cardErrors.expiry}</Text> : <View />}
              {cardErrors.cvv ? <Text style={[styles.errorText, { alignSelf: 'flex-start' }]}>{cardErrors.cvv}</Text> : <View />}
            </View>

            <TouchableOpacity style={styles.saveCardBtn} onPress={handleAddCard}>
              <Text style={styles.saveCardText}>Save card</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===================== Credit Card panel ===================== */}
        {selectedMethod === 'card' && (
          <View style={styles.methodCard}>
            <View style={styles.methodHeaderRow}>
              <View style={[styles.methodBadge, { backgroundColor: '#E8FFF3', borderColor: '#C6F5DA' }]}>
                <Text style={[styles.methodBadgeText, { color: '#0B7A53' }]}>CREDIT</Text>
              </View>
              <Text style={styles.methodTitle}>Credit Card</Text>
            </View>

            {selectedCard ? (
              <View style={styles.methodCardBox}>
                <Text style={styles.methodCardLine}>
                  {selectedCard.brand} · •••• {selectedCard.number.slice(-4)} · {selectedCard.expiry}
                </Text>
                <Text style={[styles.methodCardLine, { color: colors.muted }]}>
                  {selectedCard.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.methodEmpty}>No credit card saved. Add one above.</Text>
            )}

            {/* Breakdown (no COD fee) */}
            <View style={styles.breakdown}>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Item total</Text>
                <Text style={styles.breakValue}>{fmt(baseTotal)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Delivery charges</Text>
                <Text style={styles.breakValue}>{fmt(deliveryCharge)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Taxes (5%)</Text>
                <Text style={styles.breakValue}>{fmt(taxes)}</Text>
              </View>
              <View style={styles.codDivider} />
              <View style={styles.breakRow}>
                <Text style={[styles.breakLabel, styles.breakTotalLabel]}>Total</Text>
                <Text style={[styles.breakValue, styles.breakTotalValue]}>{fmt(grandTotalCommon)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ===================== Debit Card panel ===================== */}
        {selectedMethod === 'debit' && (
          <View style={styles.methodCard}>
            <View style={styles.methodHeaderRow}>
              <View style={[styles.methodBadge, { backgroundColor: '#EAF2FF', borderColor: '#C8DAFF' }]}>
                <Text style={[styles.methodBadgeText, { color: '#164CC9' }]}>DEBIT</Text>
              </View>
              <Text style={styles.methodTitle}>Debit Card</Text>
            </View>

            {selectedCard ? (
              <View style={styles.methodCardBox}>
                <Text style={styles.methodCardLine}>
                  {selectedCard.brand} · •••• {selectedCard.number.slice(-4)} · {selectedCard.expiry}
                </Text>
                <Text style={[styles.methodCardLine, { color: colors.muted }]}>
                  {selectedCard.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.methodEmpty}>No debit card saved. Add one above.</Text>
            )}

            {/* Breakdown (no COD fee) */}
            <View style={styles.breakdown}>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Item total</Text>
                <Text style={styles.breakValue}>{fmt(baseTotal)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Delivery charges</Text>
                <Text style={styles.breakValue}>{fmt(deliveryCharge)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Taxes (5%)</Text>
                <Text style={styles.breakValue}>{fmt(taxes)}</Text>
              </View>
              <View style={styles.codDivider} />
              <View style={styles.breakRow}>
                <Text style={[styles.breakLabel, styles.breakTotalLabel]}>Total</Text>
                <Text style={[styles.breakValue, styles.breakTotalValue]}>{fmt(grandTotalCommon)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ===================== Cash on Delivery panel ===================== */}
        {selectedMethod === 'cod' && (
          <View style={styles.codCard}>
            <View style={styles.codHeaderRow}>
              <View style={styles.codBadge}>
                <Text style={styles.codBadgeText}>COD</Text>
              </View>
              <Text style={styles.codTitle}>Cash on Delivery</Text>
            </View>

            <Text style={styles.codNote}>Pay at your doorstep. Exact change appreciated.</Text>

            {/* COD breakdown (includes COD fee) */}
            <View style={styles.breakdown}>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Item total</Text>
                <Text style={styles.breakValue}>{fmt(baseTotal)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Delivery charges</Text>
                <Text style={styles.breakValue}>{fmt(deliveryCharge)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>COD fee</Text>
                <Text style={styles.breakValue}>{fmt(codFee)}</Text>
              </View>
              <View style={styles.breakRow}>
                <Text style={styles.breakLabel}>Taxes (5%)</Text>
                <Text style={styles.breakValue}>{fmt(taxes)}</Text>
              </View>
              <View style={styles.codDivider} />
              <View style={styles.breakRow}>
                <Text style={[styles.breakLabel, styles.breakTotalLabel]}>Total to pay on delivery</Text>
                <Text style={[styles.breakValue, styles.breakTotalValue]}>{fmt(grandTotalCOD)}</Text>
              </View>
            </View>

            <Text style={styles.codEta}>Estimated delivery: 30–45 min</Text>
          </View>
        )}

        {/* Action */}
        <TouchableOpacity style={[styles.payBtn, styles.payBtnMargin]} activeOpacity={0.9} onPress={onPayNow}>
          <Text style={styles.payText}>{selectedMethod === 'cod' ? 'Place COD Order' : 'Pay Now'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },

  // Top actions
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

  // Summary
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16, color: colors.text },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
  },
  rowLabel: { color: colors.muted, fontSize: 14, marginTop: 8 },
  rowValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6 },
  total: { fontSize: 22, color: colors.primary },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 12 },

  // Methods
  sub: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.text },
  methodsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  methodBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  methodBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodText: { color: colors.text, fontWeight: '700' },
  methodTextActive: { color: '#fff' },

  // Order details (address/instructions)
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 12,
    marginBottom: 10,
  },
  detailsHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  detailsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E8F3FF',
    borderWidth: 1,
    borderColor: '#C9E3FF',
    marginRight: 8,
  },
  detailsBadgeText: { color: '#1E68D1', fontWeight: '800', fontSize: 12 },
  detailsTitle: { fontSize: 16, fontWeight: '800', color: colors.text },

  // Saved cards
  savedWrapper: { marginTop: 6 },
  cardVisual: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 10,
  },
  cardVisualSelected: {
    borderColor: colors.primary,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardBrand: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  cardNum: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardRowBelow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardName: { fontSize: 14, color: colors.muted },
  cardExpiry: { fontSize: 14, color: colors.muted },
  cardSelectArea: { flex: 1 },

  // Mini breakdown footer inside saved card
  cardMiniBreak: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  cardAddressLine: { marginTop: 8, fontSize: 12, color: colors.muted },

  // Card actions
  cardActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cardActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    marginLeft: 8,
  },
  cardActionText: { fontWeight: '700', color: colors.text },
  cardDeleteBtn: { borderColor: '#F8D7DA' },
  cardDeleteText: { color: '#D9534F', fontWeight: '700' },

  // Add card
  addCardBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 12 },
  addCardText: { color: colors.primary, fontWeight: '800' },

  // Form
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 8,
  },
  inputLabel: { fontSize: 12, color: colors.muted, marginBottom: 6, marginTop: 6 },
  inputField: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  rowInline: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  flex2: { flex: 2 },
  flex1ml: { flex: 1, marginLeft: 12 },
  saveCardBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveCardText: { color: '#fff', fontWeight: '800' },

  // Type toggle
  typeRow: { flexDirection: 'row', marginBottom: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginRight: 8,
  },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { color: colors.text, fontWeight: '700' },
  typeTextActive: { color: '#fff', fontWeight: '800' },

  // Pay button
  payBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  payBtnMargin: { marginTop: 22 },

  // Generic breakdown styles (reused)
  breakdown: { marginTop: 10 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  breakLabel: { color: colors.muted, fontSize: 14 },
  breakValue: { color: colors.text, fontWeight: '700', fontSize: 15 },
  codDivider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 10 },
  breakTotalLabel: { color: colors.text, fontWeight: '800' },
  breakTotalValue: { color: colors.primary, fontWeight: '800', fontSize: 18 },

  // Credit/Debit method cards
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 12,
  },
  methodHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  methodBadgeText: { fontWeight: '800', fontSize: 12 },
  methodTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  methodCardBox: { paddingVertical: 8 },
  methodCardLine: { fontSize: 14, color: colors.text },
  methodEmpty: { marginTop: 8, fontSize: 13, color: colors.muted },

  // COD section extra
  codCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 12,
  },
  codHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  codBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FFE1B3',
    marginRight: 8,
  },
  codBadgeText: { color: '#B4690E', fontWeight: '800', fontSize: 12 },
  codTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  codNote: { fontSize: 13, color: colors.muted, marginTop: 6 },
  codEta: { fontSize: 12, color: colors.muted, marginTop: 6 },
  errorText: { color: '#d32f2f', marginTop: 6, fontSize: 12, alignSelf: 'flex-end', marginRight: 8 },
});
