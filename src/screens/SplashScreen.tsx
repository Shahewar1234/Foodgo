import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Images from '../constants/images';
import { RootStackParamList } from '../navigation/RootNavigator';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  onFinish?: () => void;
  onLoginPress?: () => void;
  timeout?: number;
};

export default function SplashScreen({timeout = 5000}: Props) {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const t = setTimeout(() => {
      // Always navigate to Welcome screen after splash, regardless of auth
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }, timeout);
    return () => clearTimeout(t);
  }, [navigation, timeout]);



  return (
    <View style={styles.container}>
     <StatusBar barStyle="dark-content"  backgroundColor="#ffffff"  translucent={false} />
      {/* Title centered */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Foodgo</Text>
      </View>

      {/* Burgers at bottom */}
      <View style={styles.burgerContainer}>
        <Image source={Images.burger1} style={styles.burgerLeft} resizeMode="contain" />
        <Image source={Images.burger2} style={styles.burgerRight} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    color: '#fff',
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginButtonWrap: {
    width: '100%',
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
  },
  burgerContainer: {
    width: '100%',
    height: 320,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  burgerLeft: {
    width: 160,
    height: 280,
  },
  burgerRight: {
    width: 120,
    height: 200,
    marginRight: 250,
  },
});
