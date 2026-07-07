-- Complement a la migration 20260707140000_shared_workspace.sql, oubliee dans le
-- premier passage : l'historique des emails envoyes (devis/factures) doit aussi
-- etre visible par tous les comptes du workspace partage.
drop policy if exists "Users see own email logs"   on email_logs;
drop policy if exists "Users insert own email logs" on email_logs;

create policy "shared_email_logs_read" on email_logs
  for select using (auth.uid() is not null);

create policy "shared_email_logs_write" on email_logs
  for insert with check (auth.uid() is not null);
