# Onboarding with Login Integration

## Overview

This implementation adds an animated splash screen and onboarding flow with an integrated login screen as the 2nd slide.

## Features

- **Splash Screen**: Zoom-in + fade-in + pop animation, followed by zoom-out + fade-out before navigating to onboarding
- **Onboarding Slides**:
  - Slide 1: Welcome screen with Abhigyan Gurukul branding
  - Slide 2: **Login Screen** with email/password authentication
  - Slide 3: Call-to-action slide
- **Authentication**: Full integration with cbt-exam-be backend
- **Animations**: Smooth transitions using React Native Reanimated
- **Styling**: NativeWind (Tailwind CSS) for consistent design

## Files Created/Modified

### New Files

1. **`lib/api.ts`**: API client with token-based authentication
2. **`lib/auth.ts`**: Authentication utilities (login, logout, token management)
3. **`app/onboarding/LoginSlide.tsx`**: Reusable login component matching the design

### Modified Files

1. **`app/splash.tsx`**: Enhanced with zoom-out + fade-out animation
2. **`app/onboarding/data.ts`**: Updated slide data structure with `type` field
3. **`app/onboarding/Slide.tsx`**: Updated to handle optional fields
4. **`app/onboarding/index.tsx`**: Integrated login slide rendering logic
5. **`app/_layout.tsx`**: Updated navigation stack

## Setup Instructions

### 1. Backend Configuration

Update the API URL in `lib/api.ts`:

```typescript
export const API_BASE = "http://localhost:5000"; // Change to your backend URL
```

For production, use your deployed backend URL:

```typescript
export const API_BASE = "https://your-backend-url.com";
```

### 2. Install Dependencies

The AsyncStorage package has been installed:

```bash
npx expo install @react-native-async-storage/async-storage
```

### 3. Backend Requirements

Ensure your backend (`cbt-exam-be`) is running and has the following endpoint:

- **POST** `/api/auth/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, user: { id, name, email, role, ... } }`

## Authentication Flow

1. User enters credentials on the login slide
2. App sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. Token is stored in AsyncStorage
5. User object is stored in AsyncStorage
6. App navigates to main tabs on successful login

## Usage

### Login

```typescript
import { login } from "@/lib/auth";

const handleLogin = async () => {
  try {
    await login({ email: "user@example.com", password: "password123" });
    // Navigate to authenticated screens
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Get Current User

```typescript
import { getUser } from "@/lib/auth";

const user = await getUser();
console.log(user); // { id, email, name, role, ... }
```

### Logout

```typescript
import { logout } from "@/lib/auth";

await logout();
// Navigate to login or splash screen
```

### Protected Routes

To protect routes, check for token in the layout:

```typescript
import { getToken } from "@/lib/auth";

const token = await getToken();
if (!token) {
  router.replace("/splash");
}
```

## API Integration

The API client (`lib/api.ts`) automatically:

- Adds `Authorization: Bearer <token>` header to all requests
- Handles JSON serialization
- Provides error handling with status codes
- Supports FormData uploads

Example usage:

```typescript
import { apiFetch } from "@/lib/api";

// GET request
const data = await apiFetch("/api/users/me");

// POST request
const result = await apiFetch("/api/exams", {
  method: "POST",
  body: JSON.stringify({ title: "New Exam" }),
});
```

## Customization

### Skip Login

Users can skip the login slide by tapping "Skip" button. To make login mandatory, remove the skip button or modify the navigation logic in `LoginSlide.tsx`.

### Add More Slides

Add new slides to `app/onboarding/data.ts`:

```typescript
{
  id: "4",
  type: "content",
  image: require("../../assets/images/your-image.png"),
  title: "Your Title",
  subtitle: "Your subtitle",
},
```

### Styling

All components use NativeWind classes. Modify the `className` props to customize appearance.

## Testing

### Test Login Flow

1. Start the backend: `cd cbt-exam-be && npm start`
2. Start the app: `cd abhigyan-gurukul-app && npx expo start`
3. Navigate through splash → onboarding
4. Enter credentials on login slide
5. Verify navigation to tabs on success

### Test Credentials

Use existing credentials from your backend database or create test accounts.

## Troubleshooting

### Network Errors

- Ensure backend is running
- Check API_BASE URL is correct
- For Android emulator, use `http://10.0.2.2:5000` instead of `localhost:5000`
- For iOS simulator, `localhost:5000` should work

### AsyncStorage Errors

- Clear app storage: Settings → Apps → Your App → Clear Storage
- Or programmatically: `await AsyncStorage.clear()`

### TypeScript Errors

Run `npx tsc --noEmit` to check for type errors.

## Future Enhancements

- Add OAuth/Social login
- Implement refresh token logic
- Add biometric authentication
- Add "Remember Me" functionality
- Add password reset flow
- Implement secure storage (expo-secure-store) for sensitive data
