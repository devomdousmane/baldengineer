Tout est implÃ©mentÃ©. Voici le rÃ©capitulatif complet :

---
Layer 1 â Edge Middleware (proxy.ts) â 5 boucliers actifs

ââââââââââââââââââââ¬âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
â    Protection    â                                   Comportement                                   â
ââââââââââââââââââââ¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â Headers sÃ©curitÃ© â CSP, X-Frame-Options, HSTS, Referrer-Policy... sur toutes les rÃ©ponses           â
ââââââââââââââââââââ¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â Rate limiting    â 10/min chat IA Â· 5/min Factur-X Â· 30/min dashboard Â· 60/min autres API           â
ââââââââââââââââââââ¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â DÃ©tection bot    â Bloque python-requests, masscan, nuclei, etc. â transparent en local             â
ââââââââââââââââââââ¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â CORS             â Rejette les requÃªtes cross-origin sur /api/* (seul NEXT_PUBLIC_APP_URL autorisÃ©) â
ââââââââââââââââââââ¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â MÃ©thode HTTP     â 405 sur tout ce qui n'est pas GET / POST / OPTIONS                               â
ââââââââââââââââââââ´âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

Layer 2 â next.config.ts â Security headers en backup sur les routes statiques

Layer 3 â /api/ai/chat â export const runtime = "edge" â streaming Ã  latence rÃ©duite

Layer 4 â Supabase Edge Functions (Deno)
- supabase/functions/audit-log/index.ts â Enregistre les Ã©vÃ©nements en base via service role
- supabase/functions/hmac-verify/index.ts â VÃ©rification signatures webhooks (constant-time via crypto.subtle)
- supabase/functions/_shared/cors.ts â Helper CORS partagÃ©

Layer 5 â Migration SQL supabase/migrations/20260629000000_audit_logs.sql
- Table audit_logs avec RLS (chaque utilisateur voit seulement ses propres logs)
- 3 index, rÃ©tention 90j optionnelle via pg_cron

Layer 6 â Audit logging sur : logout Â· invoice.created Â· quote.created Â· settings.updated Â· facturx.generated Â· ai.chat

---
Ãtapes manuelles restantes :

1. Supabase Dashboard â SQL Editor : exÃ©cuter supabase/migrations/20260629000000_audit_logs.sql
2. Supabase Dashboard â Settings â API â Service Role : copier la clÃ© â SUPABASE_SERVICE_ROLE_KEY= dans .env.local
3. DÃ©ployer les Edge Functions :
npx supabase functions deploy audit-log --project-ref nmophdkhtkeftwjbzdxt
npx supabase functions deploy hmac-verify --project-ref nmophdkhtkeftwjbzdxt
4. Supabase Dashboard â Edge Functions â Secrets : ajouter AUDIT_LOG_SECRET=b576c61f... et SUPABASE_SERVICE_ROLE_KEY=...

â» Cogitated for 11m 18s

ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ edge-functions-security-baldpro ââ
â¯