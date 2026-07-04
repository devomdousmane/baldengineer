import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

/**
 * Zone Multi-Zones Next.js : ce SaaS est servi sous /app sur le domaine
 * public (rewrites gérés par la zone racine `site/`). basePath fait vivre
 * toutes les routes de l'app sous ce préfixe.
 *
 * Pas d'assetPrefix cross-origin ici : next/font ne préfixe pas ses URLs de
 * police avec basePath quand assetPrefix pointe vers une origine externe,
 * ce qui casse le chargement des polices (404 + erreur CORS, le path
 * `/app` manquant). En laissant les assets en relatif, ils passent par le
 * rewrite `/app/:path*` déjà en place côté `site/`, donc même origine pour
 * le navigateur — pas de CORS, et basePath est correctement appliqué partout.
 * (à ne pas confondre avec NEXT_PUBLIC_APP_URL qui reste l'URL publique du
 * domaine + /app, utilisée pour CORS API, emails et callbacks OAuth.)
 */
const basePath = "/app";

const nextConfig: NextConfig = {
  basePath,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
