import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
//import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../stores/AuthContext';
import colors from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

GoogleSignin.configure({
  webClientId: '357565236425-nu9i2jpnv24ae0litucf7u0nvtsifd3v.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

   const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]);
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken && signInWithGoogle) {
        await signInWithGoogle(userInfo.idToken);
        Alert.alert('Success', 'Google Sign-In successful!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Sign-In Failed', error.message);
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <LinearGradient colors={[colors.splashStart, colors.splashEnd]} style={styles.background}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>Foodgo</Text>
          <Text style={styles.tagline}>Crave it. Tap it. Eat it.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollCentered} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail" size={20} color={colors.muted} style={styles.icon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed" size={20} color={colors.muted} style={styles.icon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.btnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Ionicons name="logo-google" size={20} color={colors.primary} />
            <Text style={styles.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={loading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  background: { flex: 1 },
  topBar: { width: '100%', paddingHorizontal: 20, paddingTop: 80, alignItems: 'flex-start' },
  brand: { fontSize: 30, fontWeight: '900', color: '#fff', fontStyle: 'italic' },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.95)', marginTop: 6, fontWeight: '600', fontStyle: 'italic' },
  scrollCentered: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 8 , marginBottom: 70},
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: colors.text },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  loginBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: colors.muted, fontWeight: '600' },
  googleBtn: {
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: colors.primary, marginLeft: 10 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  signupLink: { fontSize: 14, color: colors.primary, fontWeight: '800' },
});
