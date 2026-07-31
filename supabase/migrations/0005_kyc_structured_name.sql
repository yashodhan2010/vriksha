alter table public.kyc_profiles
  add column if not exists first_name text,
  add column if not exists middle_name text,
  add column if not exists last_name text;

update public.kyc_profiles
set first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
    last_name = coalesce(
      last_name,
      nullif(regexp_replace(full_name, '^.*\s([^\s]+)$', '\1'), full_name)
    )
where first_name is null
   or last_name is null;
