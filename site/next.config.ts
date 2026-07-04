import type { NextConfig } from "next";

/**
 * Zone racine Multi-Zones Next.js : ce site sert le domaine public et
 * proxy /app/* vers le déploiement Netlify du SaaS (zone secondaire, voir
 * saas/next.config.ts). NEXT_PUBLIC_SAAS_DEPLOY_URL doit pointer vers l'URL
 * Netlify réelle du SaaS (ex: https://baldpro-saas.netlify.app), sans slash final.
 */
const saasDeployUrl = process.env.NEXT_PUBLIC_SAAS_DEPLOY_URL;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.15"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  async rewrites() {
    if (!saasDeployUrl) return [];
    return [
      { source: "/app", destination: `${saasDeployUrl}/app` },
      { source: "/app/:path*", destination: `${saasDeployUrl}/app/:path*` },
    ];
  },
};

export default nextConfig;
