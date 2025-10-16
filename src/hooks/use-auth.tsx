import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

type AppUser = {
  id: string;
  email: string;
  full_name: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = "app-auth-session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppUser;
        setUser(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signIn(email: string, password: string) {
      const { data, error } = await ((supabase as any).from("app_users"))
        .select("id,email,full_name,password_hash")
        .eq("email", email)
        .maybeSingle();
      if (error || !data) throw new Error("Invalid email or password");
      const ok = await bcrypt.compare(password, (data as any).password_hash);
      if (!ok) throw new Error("Invalid email or password");
      const nextUser: AppUser = { id: data.id, email: data.email, full_name: data.full_name };

      // Ensure patient profile exists on sign-in
      await supabase
        .from("patient_profiles")
        .upsert({ id: nextUser.id, full_name: nextUser.full_name || nextUser.email })
        .select("id")
        .maybeSingle();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    async signUp(email: string, password: string, fullName?: string) {
      const { data: existing } = await ((supabase as any).from("app_users"))
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existing) throw new Error("Email already registered");
      const password_hash = await bcrypt.hash(password, 10);
      const { data, error } = await ((supabase as any).from("app_users"))
        .insert({ email, password_hash, full_name: fullName || null })
        .select("id,email,full_name")
        .single();
      if (error || !data) throw new Error("Failed to create account");

      // Ensure patient profile exists on sign-up
      await supabase
        .from("patient_profiles")
        .upsert({ id: data.id, full_name: data.full_name || "User" })
        .select("id")
        .maybeSingle();

      const nextUser: AppUser = { id: data.id, email: data.email, full_name: data.full_name };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    async signOut() {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


