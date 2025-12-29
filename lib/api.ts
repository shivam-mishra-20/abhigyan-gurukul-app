import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// API configuration - Platform-specific URLs
export const getApiBase = () => {
  // Try to auto-detect the machine IP from Expo's debuggerHost
  // debuggerHost format: "192.168.x.x:19000" or "10.x.x.x:8081"
  const debuggerHost = Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  // Extract IP from debuggerHost (strip port)
  const hostIp = debuggerHost ? debuggerHost.split(':')[0] : null;
  
  console.log('[API Config] debuggerHost:', debuggerHost, 'extracted IP:', hostIp);
  
  const isExpoGo = Constants.appOwnership === "expo";
  const PORT = 5000;
  
  if (Platform.OS === "android") {
    // Physical device: use the same IP as Expo Metro bundler
    if (isExpoGo && hostIp) {
      return `http://${hostIp}:${PORT}`;
    }
    // Android emulator fallback
    return `http://10.0.2.2:${PORT}`;
  } else if (Platform.OS === "ios") {
    // iOS physical device: use host IP from Expo
    if (isExpoGo && hostIp) {
      return `http://${hostIp}:${PORT}`;
    }
    // iOS simulator fallback
    return `http://localhost:${PORT}`;
  } else {
    // Web fallback
    return `http://localhost:${PORT}`;
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
      const troubleshoot = [
        `Backend URL: ${API_BASE}`,
        `Platform: ${Platform.OS}`,
        `Expo ownership: ${Constants.appOwnership}`,
        '',
        'Troubleshooting:',
        '1. Ensure backend is running on port 5000',
        '2. Check firewall allows connections',
        '3. Verify phone and computer are on same WiFi network',
        '4. Try accessing the API in a browser: ' + API_BASE
      ].join('\n');
      
      throw new Error(`Network request failed\n\n${troubleshoot}`);
    }
    throw error;
  }
}
