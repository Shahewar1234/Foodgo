# Foodgo – Technology Stack Reference

## Quick Overview

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **UI Framework** | React Native | ^0.73+ | Cross-platform mobile (iOS/Android) |
| **Language** | TypeScript | ^5.x | Type-safe development |
| **State Mgmt** | Redux Toolkit | ^1.9+ | Centralized state management |
| **React Bindings** | React-Redux | ^8.x+ | Connect React to Redux |
| **Persistence** | Redux-Persist | ^6.x+ | Persist state to AsyncStorage |
| **Storage** | AsyncStorage | ^1.x+ | Local key-value storage |
| **Navigation** | React Navigation | ^6.x+ | Screen navigation & deep linking |
| **Backend** | Firebase | ^9.x+ | Auth, Firestore, cloud functions |
| **AI** | Google Generative AI | Latest | Gemini API for insights |
| **Testing** | Jest | ^29.x+ | Unit testing |
| **Icons** | React Native Vector Icons | ^10.x+ | Icon library |
| **UI Components** | React Native | Built-in | View, Text, TouchableOpacity, etc. |
| **Gradients** | react-native-linear-gradient | ^2.x+ | Gradient backgrounds |
| **Pickers** | @react-native-picker/picker | ^2.x+ | Dropdown component |

---

## Installation Command

### Core Redux + State Management
```bash
npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage
```

### Complete Dependencies
```bash
npm install \
  @reduxjs/toolkit \
  react-redux \
  redux-persist \
  @react-native-async-storage/async-storage \
  react-native-linear-gradient \
  @react-native-picker/picker \
  react-native-vector-icons \
  @react-native-google-signin/google-signin \
  firebase \
  @google/generative-ai \
  axios \
  moment \
  numeral
```

### Development Dependencies
```bash
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest \
  @types/jest \
  @types/node \
  typescript \
  eslint \
  prettier
```

---

## Redux Toolkit Basics for Foodgo

### 1. Store Configuration (store/store.ts)
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import paymentReducer from './slices/paymentSlice';
import uiReducer from './slices/uiSlice';
import travelReducer from './slices/travelSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'payment', 'travel'], // Persist these slices
  blacklist: ['ui'], // Don't persist transient UI state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cart: persistReducer(persistConfig, cartReducer),
    products: productsReducer,
    orders: ordersReducer,
    payment: persistReducer(persistConfig, paymentReducer),
    ui: uiReducer,
    travel: persistReducer(persistConfig, travelReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Typed Hooks (store/hooks.ts)
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 3. Slice Example: cartSlice (store/slices/cartSlice.ts)
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  deliveryFee: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  deliveryFee: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### 4. Using Redux in a Component (Example: HomeScreen)
```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { fetchProducts } from '../store/slices/productsSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products.items);
  const cartTotal = useAppSelector(state => state.cart.total);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <View>
      <Text>Cart Total: ${cartTotal}</Text>
      {products.map(product => (
        <TouchableOpacity
          key={product.id}
          onPress={() => dispatch(addToCart(product))}
        >
          <Text>{product.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 5. Async Thunk Example: Login (authSlice)
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null } as AuthState,
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export default authSlice.reducer;
```

---

## Migration Path: AuthContext → Redux

### Step 1: Keep AuthContext (Parallel)
- Redux authSlice exists alongside AuthContext
- New code uses Redux, old code still uses Context

### Step 2: Create Wrapper Hook
```typescript
// Custom hook that reads from Redux but wraps Context logic
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  
  return {
    user,
    login: (email, password) => dispatch(loginUser({ email, password })),
    logout: () => dispatch(logoutUser()),
  };
};
```

### Step 3: Refactor Screens Incrementally
- Update one screen at a time
- Test each before moving to next

### Step 4: Remove AuthContext
- Only after all screens are migrated
- Clean up Redux store

---

## Folder Structure for Redux Implementation

```
src/
├── store/
│   ├── store.ts                    # Store configuration
│   ├── hooks.ts                    # Typed hooks
│   ├── types.ts                    # TypeScript types
│   └── slices/
│       ├── authSlice.ts            # User auth + thunks
│       ├── cartSlice.ts            # Shopping cart
│       ├── productsSlice.ts        # Products catalog
│       ├── ordersSlice.ts          # Orders history
│       ├── paymentSlice.ts         # Payment methods
│       ├── uiSlice.ts              # Global UI state
│       └── travelSlice.ts          # Travel mode & currency
├── services/
│   ├── firebase.ts
│   ├── gemini.ts
│   ├── paymentService.ts
│   └── currencyService.ts
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CartScreen.tsx
│   ├── PaymentScreen.tsx
│   └── ... (other screens)
├── theme/
│   └── colors.ts
└── navigation/
    └── RootNavigator.tsx
```

---

## Redux DevTools Setup

### Installation
```bash
npm install --save-dev redux-devtools
```

### Usage in Development
```typescript
// In store.ts - already configured in Redux Toolkit
// To use DevTools browser extension:
// 1. Install Redux DevTools extension in Chrome/Firefox
// 2. Run: npx redux-devtools
// 3. Connect from app via middleware
```

### Debugging a Screen
```typescript
import { useAppSelector } from '../store/hooks';

export default function DebugScreen() {
  const state = useAppSelector(state => state); // Full state tree
  
  return (
    <ScrollView>
      <Text>{JSON.stringify(state, null, 2)}</Text>
    </ScrollView>
  );
}
```

---

## Common Redux Patterns in Foodgo

### Pattern 1: Async Fetch + Cache
```typescript
const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, lastFetch: 0 },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
      state.lastFetch = Date.now();
    },
  },
});

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const now = Date.now();
    if (now - state.products.lastFetch < 300000) {
      return state.products.items; // Return cached
    }
    // Fetch from Firestore
    const docs = await getDocs(collection(db, 'products'));
    return docs.map(doc => doc.data());
  }
);
```

### Pattern 2: Form Error State in Redux
```typescript
const uiSlice = createSlice({
  name: 'ui',
  initialState: { formErrors: {} as Record<string, Record<string, string>> },
  reducers: {
    setFormError: (state, action: PayloadAction<{ form: string; field: string; error: string }>) => {
      if (!state.formErrors[action.payload.form]) {
        state.formErrors[action.payload.form] = {};
      }
      state.formErrors[action.payload.form][action.payload.field] = action.payload.error;
    },
    clearFormErrors: (state, action: PayloadAction<string>) => {
      state.formErrors[action.payload] = {};
    },
  },
});
```

### Pattern 3: Real-time Firestore Sync
```typescript
export const subscribeToOrders = createAsyncThunk(
  'orders/subscribe',
  async (userId: string) => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        query(collection(db, 'orders'), where('userId', '==', userId)),
        (snapshot) => {
          const orders = snapshot.docs.map(doc => doc.data());
          resolve(orders);
        },
        reject
      );
    });
  }
);
```

---

## Performance Tips

1. **Memoize Selectors**
   ```typescript
   import { createSelector } from '@reduxjs/toolkit';
   
   export const selectCartTotal = createSelector(
     (state: RootState) => state.cart.items,
     items => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
   );
   ```

2. **Use `useShallow` for Nested Objects**
   ```typescript
   const user = useAppSelector(state => state.auth.user, useShallow);
   ```

3. **Batch Updates**
   ```typescript
   dispatch({
     type: 'BATCH_UPDATE',
     payload: { cart: newCart, ui: newUI }
   });
   ```

---

## Testing Redux Slices

```typescript
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addToCart } from './cartSlice';

describe('cartSlice', () => {
  it('should add item to cart', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch(addToCart({ id: '1', name: 'Pizza', price: 10, quantity: 1 }));
    expect(store.getState().cart.items).toHaveLength(1);
  });
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **State not persisting** | Check redux-persist config & AsyncStorage permissions |
| **Type errors in selectors** | Export `RootState` type from store.ts |
| **Thunk not executing** | Ensure middleware is properly configured |
| **Circular imports** | Use separate files for hooks, slices, store |
| **Performance lag** | Memoize selectors with `createSelector` |

---

## Next: Start with Phase 1

1. Install packages (see above)
2. Create `src/store/store.ts` with config
3. Create `src/store/hooks.ts` with typed hooks
4. Implement `cartSlice` (simplest)
5. Wrap App.tsx with `<Provider store={store}>` and `<PersistGate>`
6. Connect CartScreen to Redux

**Estimated Time**: 2-3 hours for full setup

---

**Last Updated**: January 2026
**Status**: Ready for implementation

