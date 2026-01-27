import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

export type Credentials = { email: string; password: string };
export type User = {
  welcomeTutorialCompleted: any;
  id?: string;
  email?: string;
  role?: "admin" | "teacher" | "student" | string;
  name?: string;
  classLevel?: string;
  batch?: string;
  firebaseUid?: string;
  phone?: string;
  targetExams?: string[];
  studyGoals?: string[];
  profileImage?: string;
  bio?: string;
  empCode?: string;
};

export type LoginResponse = { token?: string; user?: User };

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export async function login(credentials: Credentials): Promise<LoginResponse> {
  const data = (await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })) as LoginResponse;

  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if ("token" in rec && typeof rec["token"] === "string") {
      // Store token and user
      await AsyncStorage.setItem(TOKEN_KEY, rec["token"] as string);
      if ("user" in rec && rec["user"]) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(rec["user"]));
      }
    }
  }

  return data;
}

export async function logout() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function setUser(user: User) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Set user error:", error);
  }
}
