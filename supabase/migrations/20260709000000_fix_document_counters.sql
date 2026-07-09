-- La fusion des comptes (20260707140000_shared_workspace.sql) a réattribué les devis/
-- factures existants au profil de référence sans jamais avancer ses compteurs de
-- numérotation (invoice_counter_fr/gn, quote_counter_fr/gn) — le compteur pouvait donc
-- rester en retard par rapport au plus haut numéro réellement présent en base, générant
-- un numéro déjà pris à la prochaine création et faisant échouer l'insertion (contrainte
-- UNIQUE(user_id, number)). Recale chaque compteur juste après le plus haut numéro existant
-- pour le marché correspondant, quel que soit l'état actuel.
do $$
declare
  ref_id  uuid;
  max_num int;
begin
  select id into ref_id from profiles where email = 'thierno.hamza95@gmail.com';
  if ref_id is null then
    raise notice 'Profil de référence introuvable — migration ignorée';
    return;
  end if;

  -- Factures France
  select coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 0)
    into max_num
    from invoices where user_id = ref_id and market = 'france';
  if max_num > 0 then
    update profiles set invoice_counter_fr = greatest(invoice_counter_fr, max_num + 1) where id = ref_id;
  end if;

  -- Factures Guinée
  select coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 0)
    into max_num
    from invoices where user_id = ref_id and market = 'guinee';
  if max_num > 0 then
    update profiles set invoice_counter_gn = greatest(invoice_counter_gn, max_num + 1) where id = ref_id;
  end if;

  -- Devis France
  select coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 0)
    into max_num
    from quotes where user_id = ref_id and market = 'france';
  if max_num > 0 then
    update profiles set quote_counter_fr = greatest(quote_counter_fr, max_num + 1) where id = ref_id;
  end if;

  -- Devis Guinée
  select coalesce(max(nullif(regexp_replace(number, '\D', '', 'g'), '')::int), 0)
    into max_num
    from quotes where user_id = ref_id and market = 'guinee';
  if max_num > 0 then
    update profiles set quote_counter_gn = greatest(quote_counter_gn, max_num + 1) where id = ref_id;
  end if;
end $$;
