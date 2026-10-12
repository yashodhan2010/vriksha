alter table public.contact_enquiries
  add constraint contact_enquiries_phone_required
  check (phone is not null and btrim(phone) ~ '^[0-9]{7,15}$') not valid;
