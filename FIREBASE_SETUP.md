# Firebase & Google Sign-In Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable Google Analytics (optional)
4. Once created, go to **Project Settings** (gear icon)

## Step 2: Get Firebase Credentials

In Project Settings → Your apps section:
1. Create a **Web** app (for getting credentials)
2. Copy your Firebase config:

```javascript
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

3. Update `src/services/firebase.ts` with these values

## Step 3: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**

## Step 4: Setup Google Sign-In

### For Android:
1. In Firebase Console → **Project Settings** → **Your apps**
2. Select your Android app (or create one if not exists)
3. Get your **SHA-1 certificate fingerprint**:
   ```bash
   cd android
   ./gradlew signingReport
   ```
4. Add the SHA-1 to your Android app in Firebase Console
5. Download `google-services.json` and place it in `android/app/`

### For Web Client ID:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Create or find **OAuth 2.0 Client IDs** (Web type)
5. Copy the **Client ID**
6. Update the `webClientId` in `src/screens/LoginScreen.tsx` and `src/screens/SignupScreen.tsx`:
   ```javascript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     offlineAccess: true,
   });
   ```

## Step 5: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 6: Run the App

```bash
npx react-native start
npx react-native run-android
# or for iOS
npx react-native run-ios
```

## Test Credentials (Optional)

You can use test email accounts created in Firebase Console for development.

## Troubleshooting

- **Google Sign-In fails**: Ensure SHA-1 is correct in Firebase Console
- **Firebase not initializing**: Check that config values match exactly
- **AsyncStorage issues**: Make sure `@react-native-async-storage/async-storage` is installed

## Security Notes

- Never commit real Firebase credentials to version control
- Use environment variables or .env files for sensitive data in production
- Review Firebase security rules for Firestore/Realtime Database if using them
