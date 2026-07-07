-- Bascule le SaaS d'un modele "1 compte = 1 espace isole" vers un espace de travail
-- partage : tous les comptes authentifies voient et modifient les memes donnees
-- (clients, devis, factures, missions, comptabilite, fichiers) et le meme profil
-- d'entreprise (Parametres, IBAN, signature, numerotation).
--
-- Prerequis deja verifie hors de ce fichier : l'acces a l'application est restreint
-- au niveau Google Cloud Console (OAuth consent screen) a une liste connue de
-- comptes de confiance -- ouvrir le RLS ne rend donc pas les donnees publiques.

-- ─── 1. Reattribution des donnees vers le profil de reference ────────────────
-- Toutes les lignes actuellement liees au compte devomdousmane@gmail.com sont
-- reattribuees au profil de reference thierno.hamza95@gmail.com, qui devient
-- le seul user_id "proprietaire" utilise pour les nouvelles creations egalement
-- (voir lib/actions/*.ts, mis a jour separement dans le code applicatif).
do $$
declare
  ref_id   uuid;
  merge_id uuid;
begin
  select id into ref_id   from profiles where email = 'thierno.hamza95@gmail.com';
  select id into merge_id from profiles where email = 'devomdousmane@gmail.com';

  if ref_id is null then
    raise exception 'Profil de reference thierno.hamza95@gmail.com introuvable — migration annulee';
  end if;

  if merge_id is not null and merge_id <> ref_id then
    update clients             set user_id = ref_id where user_id = merge_id;
    update missions              set user_id = ref_id where user_id = merge_id;
    update accounting_entries   set user_id = ref_id where user_id = merge_id;
    update company_files        set user_id = ref_id where user_id = merge_id;
    update company_folders      set user_id = ref_id where user_id = merge_id;

    -- Devis/factures : le compte fusionne peut avoir des numeros deja pris cote
    -- reference (contrainte UNIQUE(user_id, number)) — on les renomme avec un
    -- prefixe "DUP-" avant de changer le proprietaire, pour eviter toute collision
    -- silencieuse ou perte de document ; a renommer manuellement si besoin ensuite.
    update quotes
      set number = 'DUP-' || number
      where user_id = merge_id
        and exists (select 1 from quotes q2 where q2.user_id = ref_id and q2.number = quotes.number);

    update invoices
      set number = 'DUP-' || number
      where user_id = merge_id
        and exists (select 1 from invoices i2 where i2.user_id = ref_id and i2.number = invoices.number);

    update quotes    set user_id = ref_id where user_id = merge_id;
    update invoices  set user_id = ref_id where user_id = merge_id;

    -- Deplace les fichiers physiques du dossier {merge_id}/ vers {ref_id}/ dans le bucket
    -- storage — le storage_path enregistre en base doit suivre le meme prefixe.
    update company_files
      set storage_path = ref_id::text || substring(storage_path from position('/' in storage_path))
      where storage_path like merge_id::text || '/%';

    update storage.objects
      set name = ref_id::text || substring(name from position('/' in name))
      where bucket_id = 'company-files' and name like merge_id::text || '/%';

    -- Le profil fusionne est supprime (le compte Auth associe reste actif pour se
    -- connecter — seule sa ligne de reglages d'entreprise disparait).
    delete from profiles where id = merge_id;
  end if;
end $$;

-- ─── 2. RLS partage : tout utilisateur authentifie voit/modifie tout ─────────
drop policy if exists "own_clients"       on clients;
drop policy if exists "own_quotes"        on quotes;
drop policy if exists "own_quote_lines"   on quote_lines;
drop policy if exists "own_invoices"      on invoices;
drop policy if exists "own_invoice_lines" on invoice_lines;
drop policy if exists "own_missions"      on missions;
drop policy if exists "own_accounting"    on accounting_entries;
drop policy if exists "own_company_files"   on company_files;
drop policy if exists "own_company_folders" on company_folders;

create policy "shared_clients"       on clients            using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_quotes"        on quotes             using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_quote_lines"   on quote_lines        using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_invoices"      on invoices           using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_invoice_lines" on invoice_lines      using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_missions"      on missions           using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_accounting"    on accounting_entries using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_company_files"   on company_files   using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "shared_company_folders" on company_folders using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── 3. RLS partage sur le profil d'entreprise ────────────────────────────────
-- Le profil de reference (thierno.hamza95@gmail.com) devient lisible/modifiable
-- par tout compte authentifie — il n'y a plus qu'un seul profil "entreprise".
drop policy if exists "own_profile" on profiles;
create policy "shared_profile" on profiles using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── 4. Storage : fichiers accessibles a tout utilisateur authentifie ────────
drop policy if exists "own_company_files_read"   on storage.objects;
drop policy if exists "own_company_files_write"  on storage.objects;
drop policy if exists "own_company_files_delete" on storage.objects;

create policy "shared_company_files_read" on storage.objects
  for select using (bucket_id = 'company-files' and auth.uid() is not null);

create policy "shared_company_files_write" on storage.objects
  for insert with check (bucket_id = 'company-files' and auth.uid() is not null);

create policy "shared_company_files_delete" on storage.objects
  for delete using (bucket_id = 'company-files' and auth.uid() is not null);
