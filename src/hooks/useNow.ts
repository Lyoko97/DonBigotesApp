"use client";

import { useSyncExternalStore } from "react";

// Reloj compartido que avanza cada segundo, para textos relativos como
// "Actualizado hace 5 s". Con useSyncExternalStore la hora se lee fuera del
// render (sin llamar Date.now() en el cuerpo del componente) y todos los
// componentes que lo usan se actualizan con un solo intervalo.
const TICK_MS = 1000;
const listeners = new Set<() => void>();
let intervalId: number | undefined;
let nowSnapshot = Date.now();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (intervalId === undefined) {
    nowSnapshot = Date.now();
    intervalId = window.setInterval(() => {
      nowSnapshot = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };
}

function getSnapshot() {
  return nowSnapshot;
}

// En el servidor no hay reloj en vivo: 0 indica "todavía sin hora".
function getServerSnapshot() {
  return 0;
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
