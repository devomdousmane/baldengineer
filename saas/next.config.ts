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
 * toutes les routes de l'app sous ce préfixe ; assetPrefix pointe les assets
 * statiques vers l'URL de déploiement Netlify réelle de cette zone
 * (nécessaire car les deux zones sont deux déploiements distincts) —
 * à ne pas confondre avec NEXT_PUBLIC_APP_URL qui reste l'URL publique
 * (domaine + /app) utilisée pour CORS, emails et callbacks OAuth.
 */
const basePath = "/app";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: process.env.NEXT_PUBLIC_SAAS_DEPLOY_URL || undefined,
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
