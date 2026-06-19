"use client";

import { AuthResponse, AuthUser } from "@growth/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiClient } from "./api";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthResponse) => void;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user
        }),
      login: async (payload) => {
        const session = await new ApiClient(() => null).login(payload);
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user
        });
      },
      logout: async () => {
        const token = useAuthStore.getState().accessToken;
        if (token) await new ApiClient(() => token).logout().catch(() => undefined);
        set({ accessToken: null, refreshToken: null, user: null });
      }
    }),
    { name: "growth-erp-auth" }
  )
);
