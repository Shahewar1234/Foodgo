import React, { createContext, useState, useEffect, useContext } from 'react';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Country to Currency mapping
const COUNTRY_CURRENCY_MAP: { [key: string]: { code: string; symbol: string } } = {
  'United States': { code: 'USD', symbol: '$' },
  'Canada': { code: 'CAD', symbol: 'C$' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'Australia': { code: 'AUD', symbol: 'A$' },
  'India': { code: 'INR', symbol: '₹' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'Mexico': { code: 'MXN', symbol: '$' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
};

interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  country?: string | null;
  currency?: { code: string; symbol: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, country: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const auth = firebase.auth();
      
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        console.log('Auth state changed:', currentUser?.email);
        if (currentUser) { 
          // Try to load saved currency preference
          let savedCurrency = { code: 'USD', symbol: '$' };
          try {
            const savedCurrencyStr = await AsyncStorage.getItem(`currency_${currentUser.uid}`);
            if (savedCurrencyStr) {
              savedCurrency = JSON.parse(savedCurrencyStr);
            }
          } catch (error) {
            console.log('Error loading saved currency:', error);
          }

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            country: null,
            currency: savedCurrency,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const auth = firebase.auth();
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, country: string) => {
    try {
      const auth = firebase.auth();
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Set the display name
      await userCredential.user?.updateProfile({
        displayName: name,
      }); 

      // Get currency for the selected country
      const currency = COUNTRY_CURRENCY_MAP[country] || { code: 'USD', symbol: '$' };

      // Save currency preference to AsyncStorage
      if (userCredential.user) {
        await AsyncStorage.setItem(
          `currency_${userCredential.user.uid}`,
          JSON.stringify(currency)
        );

        // Update local user state with currency and country
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          photoURL: null,
          country: country,
          currency: currency,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const auth = firebase.auth();
      await auth.signOut();
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      await firebase.auth().signInWithCredential(credential as any);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { COUNTRY_CURRENCY_MAP };
