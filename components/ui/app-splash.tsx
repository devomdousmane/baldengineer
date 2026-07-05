"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "./page-loader";

/**
 * Affiche le loader logo au tout premier montage de l'app (F5, navigation
 * directe par URL) — app/loading.tsx de Next.js ne couvre que les
 * transitions de route internes, pas un vrai rechargement navigateur.
 */
export function AppSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  return <PageLoader show={show} />;
}
