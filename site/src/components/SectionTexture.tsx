interface SectionTextureProps {
  /** Coin où placer le glow radial dominant. */
  glow?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const GLOW_POSITION: Record<NonNullable<SectionTextureProps["glow"]>, string> = {
  "top-left":     "15% 10%",
  "top-right":    "85% 15%",
  "bottom-left":  "10% 90%",
  "bottom-right": "90% 85%",
};

/**
 * Texture de fond légère et cohérente pour les sections hors Hero (qui a son
 * propre canvas Three.js). Grille fine + glow radial discret — CSS pur, pas
 * de coût de rendu, pour éviter un fond plat/vide entre les sections animées.
 */
export function SectionTexture({ glow = "top-right" }: SectionTextureProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at ${GLOW_POSITION[glow]}, rgba(45,138,62,0.09), transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45,138,62,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,138,62,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 40%, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 40%, black 30%, transparent 85%)",
        }}
      />
    </div>
  );
}
