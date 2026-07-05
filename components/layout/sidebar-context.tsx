"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

interface SidebarContextValue {
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  /** Sidebar desktop repliée en mode icônes seules. */
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "baldpro:sidebar-collapsed";

/* Lecture localStorage safe pour l'hydratation : le serveur "voit" toujours
   false (identique au premier rendu client), la vraie valeur arrive après. */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}
function getServerSnapshot() {
  return false;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const storedCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [overrideCollapsed, setOverrideCollapsed] = useState<boolean | null>(null);
  const collapsed = overrideCollapsed ?? storedCollapsed;

  const toggleCollapsed = () => {
    const next = !collapsed;
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    setOverrideCollapsed(next);
  };

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        collapsed,
        toggleCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/** Utilisable partout dans le dashboard (Header, Sidebar) pour piloter le drawer mobile et le collapse desktop. */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar doit être utilisé sous SidebarProvider");
  return ctx;
}
