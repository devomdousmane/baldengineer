import { Resend } from "resend";

let client: Resend | null = null;

/** Instanciation paresseuse : évite de crasher le build quand RESEND_API_KEY est absent. */
export function getResend(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY manquant — configurez-le dans .env.local");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "BaldPro <noreply@baldpro.app>";
