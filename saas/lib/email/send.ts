import { resend, EMAIL_FROM } from "./client";
import type { CreateEmailOptions } from "resend";

export interface SendResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

interface SendEmailOpts {
  to: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(opts: SendEmailOpts): Promise<SendResult> {
  const payload: CreateEmailOptions = {
    from: opts.from ?? EMAIL_FROM,
    to: [opts.to],
    ...(opts.cc ? { cc: [opts.cc] } : {}),
    ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    subject: opts.subject,
    html: opts.html,
  };

  try {
    const { data, error } = await resend.emails.send(payload);
    if (error) return { success: false, error: error.message };
    return { success: true, resendId: data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
}
