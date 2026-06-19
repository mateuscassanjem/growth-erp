"use client";

import { useMemo } from "react";
import { ApiClient } from "./api";
import { useAuthStore } from "./store";

export function useApi() {
  const token = useAuthStore((state) => state.accessToken);
  return useMemo(() => new ApiClient(() => token), [token]);
}
