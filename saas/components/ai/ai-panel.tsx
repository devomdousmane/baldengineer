"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, RotateCcw, Bot, User } from "lucide-react";
import { usePathname } from "next/navigation";

interface Message { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "Comment rédiger une relance de paiement ?",
  "Quelles mentions obligatoires sur une facture FR ?",
  "Explique-moi le système Factur-X",
  "Conseils pour optimiser ma trésorerie",
];

interface AiPanelProps {
  open: boolean;
  onClose: () => void;
  market?: string;
}

export function AiPanel({ open, onClose, market }: AiPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const allMessages = [...messages, userMsg];
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          context: { page: pathname, market },
        }),
      });

      if (!res.ok) throw new Error("Erreur API");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Désolé, une erreur est survenue. Vérifiez que ANTHROPIC_API_KEY est configurée." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [loading, messages, pathname, market]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-[var(--z-modal)] flex flex-col bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-[var(--shadow-xl)]"
            style={{ width: "min(420px, 90vw)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]" style={{ height: "var(--header-height)" }}>
              <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">Assistant IA</p>
                <p className="text-[10px] text-[var(--color-text-3)]">Propulsé par Claude</p>
              </div>
              <button
                onClick={() => { setMessages([]); }}
                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
                aria-label="Effacer la conversation"
                title="Effacer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="text-center pt-6 pb-2">
                    <div className="w-12 h-12 rounded-[var(--radius-xl)] mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)" }}>
                      <Sparkles className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Comment puis-je vous aider ?</p>
                    <p className="text-xs text-[var(--color-text-3)] mt-1">Posez-moi vos questions sur la gestion de votre activité.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="text-left text-xs px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-2)] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: msg.role === "user" ? "var(--color-primary)" : "var(--color-accent-dim)",
                      color: msg.role === "user" ? "var(--color-text-inv)" : "var(--color-accent)",
                    }}
                  >
                    {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div
                    className={`max-w-[85%] text-xs leading-relaxed rounded-[var(--radius-md)] px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-[var(--color-primary)] text-[var(--color-text-inv)]"
                        : "bg-[var(--color-bg-2)] text-[var(--color-text)]"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                    {msg.role === "assistant" && loading && i === messages.length - 1 && msg.content === "" && (
                      <span className="inline-flex gap-1 ml-1">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="w-1 h-1 rounded-full bg-current inline-block"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border)]">
              <div className="flex gap-2 items-end bg-[var(--color-bg-2)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 focus-within:border-[var(--color-accent)] transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none text-xs text-[var(--color-text)] bg-transparent placeholder:text-[var(--color-text-3)] focus:outline-none max-h-32 leading-relaxed disabled:opacity-50"
                  style={{ lineHeight: "1.6" }}
                />
                <motion.button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.88 }}
                  className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                  aria-label="Envoyer"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              <p className="text-[10px] text-[var(--color-text-3)] text-center mt-2">Claude · Ne pas partager de données sensibles</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
