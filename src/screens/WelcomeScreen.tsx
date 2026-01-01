import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import Images from '../constants/images';
import { RootStackParamList } from '../navigation/RootNavigator';

GoogleSignin.configure({
  webClientId: '357565236425-nu9i2jpnv24ae0litucf7u0nvtsifd3v.apps.googleusercontent.com',
  offlineAccess: true,
});

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  onLoginPress?: () => void;
};

export default function WelcomeScreen({ }: Props) {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <LinearGradient colors={[colors.splashStart, colors.splashEnd]} style={styles.gradient}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Foodgo</Text>
          <Text style={styles.subtitle}>Delicious food delivered fast!</Text>
        </View>

        <Image source={Images.burgerStack} style={styles.hero} resizeMode="contain" />

        <View style={styles.bottom}>
          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  gradient: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  topBar: { width: '100%', paddingHorizontal: 24, alignItems: 'center', marginTop: 50 },
  title: { fontSize: 40, color: '#fff', fontWeight: '800', fontStyle: 'italic' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8, fontStyle: 'italic' },
  hero: { width: '100%', height: 300 },
  bottom: { width: '100%', paddingHorizontal: 24 },
  loginBtn: { backgroundColor: 'rgba(248, 13, 13, 0.3)', paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginBottom: 50},
  loginText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
