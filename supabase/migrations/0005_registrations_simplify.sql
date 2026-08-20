-- Simplify registrations: we no longer collect the parent's name or an
-- emergency contact. The form now captures only parent email + phone and the
-- student's name/grade. Parent email stays required; phone is enforced at the
-- application layer.

alter table registrations
  drop column if exists parent_first_name,
  drop column if exists parent_last_name,
  drop column if exists emergency_contact_name,
  drop column if exists emergency_contact_phone;
