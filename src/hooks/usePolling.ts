"use client";

import { useEffect, useRef } from "react";

// Ejecuta `callback` cada `intervalMs` mientras la pestaña esté visible, y
// una vez más en cuanto el usuario vuelve a ella (cambio de pestaña o foco
// de la ventana). Así la vista se mantiene al día sin gastar invocaciones
// del servidor cuando nadie la está mirando.
export function usePolling(callback: () => unknown, intervalMs: number, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const runIfVisible = () => {
      if (document.visibilityState === "visible") {
        void callbackRef.current();
      }
    };

    const intervalId = window.setInterval(runIfVisible, intervalMs);
    document.addEventListener("visibilitychange", runIfVisible);
    window.addEventListener("focus", runIfVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", runIfVisible);
      window.removeEventListener("focus", runIfVisible);
    };
  }, [intervalMs, enabled]);
}
