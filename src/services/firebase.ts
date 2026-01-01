import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase credentials from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyAM2MLrM1EiFQ9BD7juHA_2OhYuEMG_qmg',
  authDomain: 'foodgo-cb901.firebaseapp.com',
  projectId: 'foodgo-cb901',
  storageBucket: 'foodgo-cb901.firebasestorage.app',
  messagingSenderId: '620810342380',
  appId: '1:620810342380:android:601d20167f08059bb1fac9',
};

let app: any;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app };

export const getAuthInstance = () => {
  try {
    return getAuth(app);
  } catch (error) {
    console.error('Error getting auth instance:', error);
    throw error;
  }
};
