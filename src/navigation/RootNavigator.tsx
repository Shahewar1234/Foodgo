import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductDetailScreen2 from '../screens/ProductDetailScreen2';
import WelcomeScreen from '../screens/WelcomeScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuth } from '../stores/AuthContext';
import colors from '../theme/colors';

enableScreens(true);
/** Typed route params for the app */
export type RootStackParamList = {
  Welcome: undefined;
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  ProductDetail: {
    product: {
      id: string;
      name: string;
      category: string;
      price: string;
      rating: number;
      image: ImageSourcePropType;
    };
  };
  ProductDetail2: {
    product: {
      id: string;
      name: string;
      category: string;
      price: string;
      rating: number;
      image: ImageSourcePropType;
    };
  };
  Payment: { order: { productId?: string; name?: string; total: string } };
  Success: undefined;
  Profile: undefined;
  Chat: undefined;
  Favorites: { favorites: string[]; products: any[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

function RootStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductDetail2" component={ProductDetailScreen2} />
      <Stack.Screen
        name="Payment"
        component={require('../screens/PaymentScreen').default}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Success"
        component={require('../screens/SuccessScreen').default}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Profile" component={require('../screens/ProfileScreen').default} />
      <Stack.Screen name="Chat" component={require('../screens/ChatScreen').default} />
      <Stack.Screen name="Favorites" component={require('../screens/FavoritesScreen').default} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* Everyone always starts at Splash */}
        <RootStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
