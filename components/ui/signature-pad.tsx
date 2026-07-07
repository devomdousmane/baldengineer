"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

interface Props {
  /** data URL PNG existante à pré-afficher (ex. signature déjà enregistrée) */
  initialValue?: string | null;
  onChange: (dataUrl: string | null) => void;
  height?: number;
}

/** Zone de dessin tactile/souris pour capturer une signature manuscrite en PNG (fond transparent). */
export function SignaturePad({ initialValue, onChange, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [isEmpty, setIsEmpty] = useState(!initialValue);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1E293B";

    if (initialValue) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = initialValue;
      hasInk.current = true;
      setIsEmpty(false);
    }
  }, [initialValue]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
    setIsEmpty(false);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(hasInk.current ? canvasRef.current!.toDataURL("image/png") : null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-2)] bg-white overflow-hidden touch-none"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-3)] pointer-events-none">
            Signez ici avec la souris ou le doigt
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
      >
        <Eraser className="w-3.5 h-3.5" /> Effacer
      </button>
    </div>
  );
}
