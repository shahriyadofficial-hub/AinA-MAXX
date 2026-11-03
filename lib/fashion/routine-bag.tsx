"use client";

// lib/fashion/routine-bag.tsx
// AinA Drip — fashion-scoped Routine Bag store.
// In-memory React context only: no backend persistence, no telemetry of
// body/size data beyond the chosen garment size the user explicitly picks.
// (The /shop page keeps its own separate bag — this store serves the hub.)

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export interface RoutineBagItem {
  productId: string;
  title: string;
  brand: string;
  priceBDT: number;
  size: string;
  qty: number;
}

export interface RoutineBagToast {
  id: number;
  message: string;
}

interface RoutineBagContextValue {
  items: RoutineBagItem[];
  count: number;
  totalBDT: number;
  isBagOpen: boolean;
  toast: RoutineBagToast | null;
  addItem: (item: Omit<RoutineBagItem, "qty">) => void;
  removeItem: (productId: string, size: string) => void;
  openBag: () => void;
  closeBag: () => void;
  dismissToast: () => void;
}

const RoutineBagContext = createContext<RoutineBagContextValue | null>(null);

export function RoutineBagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RoutineBagItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [toast, setToast] = useState<RoutineBagToast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const addItem = useCallback(
    (item: Omit<RoutineBagItem, "qty">) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId && i.size === item.size);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.size === item.size ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prev, { ...item, qty: 1 }];
      });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message: `Added ${item.title} (Size ${item.size}) to your Routine Bag` });
      toastTimer.current = setTimeout(() => setToast(null), 3200);
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const openBag = useCallback(() => setIsBagOpen(true), []);
  const closeBag = useCallback(() => setIsBagOpen(false), []);

  const value = useMemo<RoutineBagContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const totalBDT = items.reduce((sum, i) => sum + i.qty * i.priceBDT, 0);
    return {
      items,
      count,
      totalBDT,
      isBagOpen,
      toast,
      addItem,
      removeItem,
      openBag,
      closeBag,
      dismissToast,
    };
  }, [items, isBagOpen, toast, addItem, removeItem, openBag, closeBag, dismissToast]);

  return <RoutineBagContext.Provider value={value}>{children}</RoutineBagContext.Provider>;
}

export function useRoutineBag(): RoutineBagContextValue {
  const ctx = useContext(RoutineBagContext);
  if (!ctx) throw new Error("useRoutineBag must be used inside <RoutineBagProvider>");
  return ctx;
}
