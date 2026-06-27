"use client";

import { useState, useRef, FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const infos = [
  {
    icon: Mail,
    label: "Email",
    value: "thierno.balde@baldengineer.fr",
    href: "mailto:thierno.balde@baldengineer.fr",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "06.59.98.06.88",
    href: "tel:0659980688",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "42 rue Jacques Benoist, 27140 Gisors",
    href: null,
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lundi – Vendredi : 8h00 à 18h00",
    href: null,
  },
];

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulated submit — replace with your API call
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 4000);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-[var(--color-cta)]";
  const inputStyle = {
    borderColor: "var(--color-input-border)",
    color: "var(--color-text)",
    backgroundColor: "var(--color-input-bg)",
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 px-4 sm:px-6"
      style={{ backgroundColor: "var(--color-bg-2)" }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Contact"
          title="Discutons de votre projet"
          subtitle="Besoin d'un accompagnement technique ou d'un devis pour vos installations CFO/CFA ? Je vous réponds rapidement."
        />

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="lg:col-span-2 space-y-4"
          >
            {infos.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl p-5 border"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 12%, var(--color-card))" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--color-cta)" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--color-muted)" }}>
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-medium transition-colors duration-200 hover:opacity-70 cursor-pointer"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* CTA urgence */}
            <div
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: "var(--color-urgent-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-primary)" }}>
                Projet urgent ?
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
                Appelez directement pour une réponse immédiate.
              </p>
              <a
                href="tel:0659980688"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--color-cta)" }}
              >
                <Phone className="w-4 h-4" />
                06.59.98.06.88
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <div
              className="rounded-2xl p-6 sm:p-8 border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
            >
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-4"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-cta) 15%, var(--color-card))" }}>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                    Message envoyé !
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Je vous répondrai dans les plus brefs délais.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Nom complet *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.fr"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="06 XX XX XX XX"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "var(--color-muted)" }}
                      >
                        Sujet *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">Choisir...</option>
                        <option value="devis">Demande de devis</option>
                        <option value="etude">Étude CFO/CFA</option>
                        <option value="mission">Mission d'ingénierie</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--color-muted)" }}
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet électrique..."
                      className={`${inputClass} resize-none`}
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 cursor-pointer"
                    style={{ backgroundColor: "var(--color-cta)" }}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
