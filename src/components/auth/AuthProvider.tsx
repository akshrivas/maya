"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { firebase } from "@/lib/firebase/client";

type AuthState = { user: User | null; loading: boolean };

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const { auth } = firebase();
    return onIdTokenChanged(auth, (user) => setState({ user, loading: false }));
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function logout() {
  await signOut(firebase().auth);
}

/** fetch() to our own API with the logged-in user's token attached. */
export async function authedFetch(path: string, init: RequestInit = {}) {
  const user = firebase().auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
}
