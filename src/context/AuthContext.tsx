import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchAuthUser, type AuthUser } from "@/lib/adminApi";
import { PORTAL_ACCESS_DENIED } from "@/lib/authMessages";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const signInInProgress = useRef(false);

  const fetchProfile = async (token: string) => {
    const { user: profile } = await fetchAuthUser(token);
    return profile;
  };

  const applyAdminSession = async (token: string, profile: AuthUser) => {
    if (profile.role !== "admin") {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      return false;
    }

    setUser(profile);
    setAccessToken(token);
    return true;
  };

  const restoreSession = async (token: string) => {
    try {
      const profile = await fetchProfile(token);
      await applyAdminSession(token, profile);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    client.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;

      const token = data.session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      await restoreSession(token);
      if (!cancelled) setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      if (signInInProgress.current) return;

      const token = session?.access_token;
      if (!token) {
        setUser(null);
        setAccessToken(null);
        return;
      }

      await restoreSession(token);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    signInInProgress.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session?.access_token) {
        throw new Error("No session returned");
      }

      const token = data.session.access_token;
      const profile = await fetchProfile(token);

      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        setUser(null);
        setAccessToken(null);
        throw new Error(PORTAL_ACCESS_DENIED);
      }

      setUser(profile);
      setAccessToken(token);
      return profile;
    } finally {
      signInInProgress.current = false;
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAccessToken(null);
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

export { isSupabaseConfigured };
