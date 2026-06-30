import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAuthUser,
  isApiConfigured,
  portalLogout,
  portalSignIn,
  refreshAccessToken,
  setAccessToken,
  type AuthUser,
} from "@/lib/adminApi";

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token: string) => {
    const { user: profile } = await fetchAuthUser(token);
    return profile;
  };

  const applyAdminSession = async (token: string, profile: AuthUser) => {
    if (profile.accessRevoked) {
      await portalLogout().catch(() => undefined);
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
      return false;
    }

    if (profile.role !== "admin") {
      await portalLogout().catch(() => undefined);
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
      return false;
    }

    setAccessToken(token);
    setAccessTokenState(token);
    setUser(profile);
    return true;
  };

  const restoreSession = async (token: string) => {
    try {
      const profile = await fetchProfile(token);
      await applyAdminSession(token, profile);
    } catch {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!isApiConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const token = await refreshAccessToken();
      if (cancelled) return;

      if (!token) {
        setLoading(false);
        return;
      }

      await restoreSession(token);
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isApiConfigured) {
      throw new Error("API is not configured");
    }

    const { access_token, user: profile } = await portalSignIn(email, password, "admin");
    setAccessToken(access_token);
    setAccessTokenState(access_token);
    setUser(profile);
    return profile;
  };

  const signOut = async () => {
    await portalLogout().catch(() => undefined);
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        loading,
        accessToken,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { isApiConfigured };
