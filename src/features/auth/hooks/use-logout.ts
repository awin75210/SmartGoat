"use client";

import { useCallback, useState } from "react";
import { logoutAction } from "@/features/auth/actions/login.actions";

/** Full navigation after logout — avoids React 19 Suspense/async cleanup when using redirect() inside a server action. */
export function useLogout() {
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(() => {
    void (async () => {
      setLoggingOut(true);
      try {
        const result = await logoutAction();
        if (result.ok) {
          // Full navigation — do not setState after this or React 19 may warn during teardown.
          window.location.assign(result.data.redirectTo);
          return;
        }
        setLoggingOut(false);
      } catch {
        setLoggingOut(false);
      }
    })();
  }, []);

  return { logout, loggingOut };
}
