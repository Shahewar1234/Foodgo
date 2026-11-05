<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:E8453C,100:F5A623&height=180&section=header&text=Foodgo&fontSize=54&fontColor=ffffff&fontAlignY=38&desc=Cross-Platform%20Food%20Ordering%20App&descSize=18&descAlignY=60" width="100%" alt="Foodgo banner"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native_0.83-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/React_Navigation-6B52AE?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android_&_iOS-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
</p>

<p align="center">
  A food ordering app for <b>Android and iOS</b>, built with <b>React Native and TypeScript</b>.<br/>
  Browse the menu, customize your meal, save favorites, pay and get help from in-app support.
</p>

---

## ✨ Features

| | Feature | What it does |
| --- | --- | --- |
| 🚀 | **Splash & Onboarding** | Branded splash and welcome screens for first-time users |
| 🔐 | **Authentication** | Email/password sign-up and login plus Google Sign-In via Firebase Authentication, with a persistent session |
| 🍔 | **Menu Browsing** | Explore food items with images, ratings, prices and categories |
| 🌶️ | **Product Customization** | Choose spice level with a slider and pick portion size on the detail screen |
| ❤️ | **Favorites** | Save dishes you love for quick access |
| 💳 | **Checkout & Payment** | Order summary with card, UPI and cash payment options, followed by an order success screen |
| 💬 | **Support Chat** | In-app support chat with quick replies for order status, refunds and delivery issues |
| 👤 | **Profile** | View and manage user details |

---

## 🛠️ Tech Stack

| Category | Technologies |
| --- | --- |
| **Framework** | React Native 0.83, TypeScript |
| **Navigation** | React Navigation (Native Stack & Stack) |
| **State Management** | React Context API (`AuthContext`) |
| **Storage** | AsyncStorage |
| **Authentication** | Firebase Authentication, Google Sign-In |
| **UI** | React Native Linear Gradient, Vector Icons (Ionicons, FontAwesome), Slider, Picker, Gesture Handler |
| **Testing & Quality** | Jest, ESLint, Prettier |

---

## 📂 Project Structure

```
src/
├── screens/       # Splash, Welcome, Login, Signup, Home, ProductDetail, Favorites, Payment, Success, Chat, Profile
├── navigation/    # RootNavigator with auth-aware routing
├── stores/        # AuthContext for session and user state
├── services/      # Firebase setup
├── constants/     # Product data and image assets
└── theme/         # App color palette
```

---

## 📸 Screenshots

<!-- Add your screenshots to a /screenshots folder, then remove this comment line and the one at the end.
<p align="center">
  <img src="screenshots/home.png" width="22%"/>
  <img src="screenshots/product_detail.png" width="22%"/>
  <img src="screenshots/payment.png" width="22%"/>
  <img src="screenshots/chat.png" width="22%"/>
</p>
-->

*Screenshots coming soon.*

---

## 🚀 Getting Started

**Requirements:** Node.js 20+, React Native development environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment)), Android Studio and/or Xcode.

```bash
git clone https://github.com/Shahewar1234/Foodgo.git
cd Foodgo
npm install
```

1. Create a Firebase project, enable **Email/Password** and **Google** sign-in, and add your own `google-services.json` to `android/app/`.
2. Start Metro: `npm start`
3. Run the app:

```bash
npm run android
# or, for iOS
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

Run tests with `npm test`.

---

## 👩‍💻 Author

**Shahewar Khan** — React Native Developer

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shahewar1234)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/shahewar-khan-8a8365215)
