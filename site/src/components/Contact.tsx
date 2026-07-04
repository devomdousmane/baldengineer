"use client";

import { useState, useRef, FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { SectionTexture } from "./SectionTexture";

const infos = [
  { icon: Mail,  label: "Email",    value: "thierno.balde@baldengineer.fr", href: "mailto:thierno.balde@baldengineer.fr" },
  { icon: Phone, label: "Téléphone",value: "06.59.98.06.88",                href: "tel:0659980688" },
  { icon: MapPin,label: "Adresse",  value: "42 rue Jacques Benoist, 27140 Gisors", href: null },
  { icon: Clock, label: "Horaires", value: "Lun – Ven : 8h00 à 18h00",     href: null },
];

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 4500);
  };

  /* Shared input styles — underline-only Diorama */
  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-border-solid)",
    borderRadius: 0,
    padding: "10px 0",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  return (
    <section
      id="contact"
      className="relative py-28 sm:py-36 px-6 sm:px-10"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <SectionTexture glow="top-right" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          label="Contact"
          title="Discutons de votre projet"
          subtitle="Besoin d'un accompagnement technique ou d'un devis ? Je vous réponds rapidement."
        />

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-6"
          >
            {infos.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] mb-1"
                    style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                  >
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm transition-colors duration-200 hover:text-[var(--color-accent-hi)]"
                      style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Urgence */}
            <div
              className="rounded-2xl p-5 border mt-8"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-2)" }}
            >
              <p
                className="italic text-lg mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
              >
                Projet urgent ?
              </p>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)" }}
              >
                Appelez directement pour une réponse immédiate.
              </p>
              <a
                href="tel:0659980688"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ backgroundColor: "var(--color-accent)", boxShadow: "var(--shadow-glow)" }}
                aria-label="Appeler le 06 59 98 06 88"
              >
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                06.59.98.06.88
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <div
              className="rounded-2xl p-6 sm:p-10 border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-3)" }}
            >
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center py-16 gap-5"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-dim)", border: "1px solid var(--color-border)" }}
                  >
                    <CheckCircle2 className="w-8 h-8" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                  </div>
                  <h3
                    className="italic text-2xl"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                  >
                    Message envoyé !
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-2)", fontFamily: "var(--font-body)" }}>
                    Je vous répondrai dans les plus brefs délais.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>

                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                      >
                        Nom complet *
                      </label>
                      <input
                        id="name" name="name" type="text" required
                        value={form.name} onChange={handleChange}
                        placeholder="Jean Dupont"
                        autoComplete="name"
                        style={inputBase}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-accent)")}
                        onBlur={(e)  => (e.target.style.borderBottomColor = "var(--color-border-solid)")}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                      >
                        Email *
                      </label>
                      <input
                        id="email" name="email" type="email" required
                        value={form.email} onChange={handleChange}
                        placeholder="jean@exemple.fr"
                        autoComplete="email"
                        style={inputBase}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-accent)")}
                        onBlur={(e)  => (e.target.style.borderBottomColor = "var(--color-border-solid)")}
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                      >
                        Téléphone
                      </label>
                      <input
                        id="phone" name="phone" type="tel"
                        value={form.phone} onChange={handleChange}
                        placeholder="06 XX XX XX XX"
                        autoComplete="tel"
                        style={inputBase}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-accent)")}
                        onBlur={(e)  => (e.target.style.borderBottomColor = "var(--color-border-solid)")}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                        style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                      >
                        Sujet *
                      </label>
                      <select
                        id="subject" name="subject" required
                        value={form.subject} onChange={handleChange}
                        style={{ ...inputBase, paddingLeft: 0 }}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-accent)")}
                        onBlur={(e)  => (e.target.style.borderBottomColor = "var(--color-border-solid)")}
                      >
                        <option value="" style={{ background: "var(--color-surface)" }}>Choisir...</option>
                        <option value="devis"    style={{ background: "var(--color-surface)" }}>Demande de devis</option>
                        <option value="etude"    style={{ background: "var(--color-surface)" }}>Étude CFO/CFA</option>
                        <option value="mission"  style={{ background: "var(--color-surface)" }}>Mission d'ingénierie</option>
                        <option value="autre"    style={{ background: "var(--color-surface)" }}>Autre</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-[10px] uppercase tracking-[0.2em] mb-2"
                      style={{ color: "var(--color-text-2)", fontFamily: "var(--font-mono)" }}
                    >
                      Message *
                    </label>
                    <textarea
                      id="message" name="message" required rows={5}
                      value={form.message} onChange={handleChange}
                      placeholder="Décrivez votre projet électrique..."
                      style={{ ...inputBase, resize: "none", lineHeight: 1.7 }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-accent)")}
                      onBlur={(e)  => (e.target.style.borderBottomColor = "var(--color-border-solid)")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                    style={{ backgroundColor: "var(--color-accent)", boxShadow: "var(--shadow-glow)", minHeight: "52px" }}
                    aria-live="polite"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={1.5} />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
