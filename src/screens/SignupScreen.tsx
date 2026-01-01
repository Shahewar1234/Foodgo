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
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAuth } from '../stores/AuthContext';
import colors from '../theme/colors';

const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France', 'Japan', 'Mexico', 'Brazil'];

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

    const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }    

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name, country);
      Alert.alert(
        'Success',
        'Account created successfully! Selected country: ' + country,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <LinearGradient colors={[colors.splashStart, colors.splashEnd]} style={styles.background}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.topBar}>
          <Text style={styles.brand}>Foodgo</Text>
          <Text style={styles.tagline}>Join us for fresh, delicious meals delivered to your doorstep!</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollCentered} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person" size={20} color={colors.muted} style={styles.icon} />
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Country Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={country}
                  onValueChange={(itemValue: string) => setCountry(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {countries.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

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
                placeholder="Create a password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password} 
                onChangeText={ setPassword}  
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed" size={20} color={colors.muted} style={styles.icon} />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginLink}>Login</Text>
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
  topBar: { width: '100%', paddingHorizontal: 20, paddingTop: 100, alignItems: 'center' },
  brand: { fontSize: 30, fontWeight: '900', color: '#fff', fontStyle: 'italic' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.95)', marginTop: 6, fontWeight: '600', fontStyle: 'italic' },
  scrollCentered: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 8, marginBottom: 70},
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  pickerWrap: { borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  picker: { height: 50 },
  pickerItem: { color: colors.text },
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
  signupBtn: {
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
  signupBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  loginLink: { fontSize: 14, color: colors.primary, fontWeight: '800' },
});
