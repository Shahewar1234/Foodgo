import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
//import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import Images from '../constants/images';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../stores/AuthContext';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            Alert.alert('Success', 'You have been logged out');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error: any) {
            Alert.alert('Error', error.message);
            setLoggingOut(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      <LinearGradient
        colors={[colors.splashStart, colors.splashEnd]}
        style={styles.topGradient}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarWrap}
          >
            <Image source={user?.photoURL ? { uri: user.photoURL } : Images.avatarPlaceholder} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>{user?.displayName || 'No name available'}</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>{user?.email || 'No email available'}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Payment Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Order history</Text>
        </TouchableOpacity>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutBtn, loggingOut && styles.btnDisabled]}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.9}
          >
            {loggingOut ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.logoutText}>Log out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  topGradient: { height: 220, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerInner: { alignItems: 'center', paddingTop: 24 },
  avatarWrap: { marginTop: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  avatar: { width: 112, height: 112, borderRadius: 18, borderWidth: 4, borderColor: '#fff' },
  card: { flex: 1, marginTop: -56, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  label: { color: colors.muted, marginTop: 8, marginBottom: 6, fontWeight: '600' },
  inputBox: { borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 14, padding: 14, backgroundColor: '#fff', marginBottom: 12 },
  inputText: { fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 12 },
  row: { paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 0, marginBottom: 8 },
  rowText: { fontWeight: '700', color: colors.text },
  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  editBtn: { flex: 0.48, backgroundColor: '#2f1f1f', paddingVertical: 14, borderRadius: 18, alignItems: 'center' },
  editText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { flex: 0.48, borderWidth: 2, borderColor: colors.primary, paddingVertical: 14, borderRadius: 18, alignItems: 'center' },
  logoutText: { color: colors.primary, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
