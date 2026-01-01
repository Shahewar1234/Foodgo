import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';  

export default function SuccessScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      <View style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.title}>Success !</Text>
          <Text style={styles.desc}>Your payment was successful. Thanks for your order.</Text>

          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: '86%', backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 6 },
  check: { fontSize: 44, color: colors.primary, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#666', textAlign: 'center', marginBottom: 18 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
});
