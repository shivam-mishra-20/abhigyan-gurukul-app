import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// API configuration - Platform-specific URLs
const getApiBase = () => {
  // Your computer's local IP address (for physical devices)
  const YOUR_COMPUTER_IP = "192.168.29.187";
  
  // Check if running on physical device (Expo Go)
  const isExpoGo = Constants.appOwnership === "expo";
  
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2, physical device needs your IP
    return isExpoGo ? `http://${YOUR_COMPUTER_IP}:5000` : "http://10.0.2.2:5000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:5000"; // iOS simulator
  } else {
    return "http://localhost:5000"; // Web
  }
};

export const API_BASE = getApiBase();

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  console.log(`[API] ${options.method || "GET"} ${url}`);

  const headers = new Headers(options.headers || {});

  // Add auth token if available
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    console.error("Error reading token:", error);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, { ...options, headers });

    // Handle 204 No Content
    if (res.status === 204) return null;

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // Not JSON
    }

    if (!res.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message: string }).message)
          : res.statusText || "API error";
      console.error(`[API Error] ${res.status}: ${message}`);
      const err = new Error(message) as ApiError;
      err.status = res.status;
      err.data = data;
      throw err;
    }

    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Network error:`, error);
    if (error instanceof Error && error.message.includes("Network request failed")) {
      throw new Error(
        `Cannot connect to backend at ${API_BASE}. Please ensure:\n1. Backend server is running\n2. URL is correct for your platform (${Platform.OS})`
      );
    }
    throw error;
  }
}
