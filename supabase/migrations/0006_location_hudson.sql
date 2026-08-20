-- Standardize on a single location: Hudson Montessori School (Jersey City, NJ).
-- The location management UI has been removed; classes pick from this list.

-- Rename the original seeded location if it's still there.
update locations
  set name = 'Hudson Montessori School'
  where name = '101Discoveries Jersey City';

-- Ensure the location exists even if the seed row was never present.
insert into locations (name, city, state)
select 'Hudson Montessori School', 'Jersey City', 'NJ'
where not exists (
  select 1 from locations where name = 'Hudson Montessori School'
);

-- NOTE: If you created extra test locations while the editor existed, delete
-- them in the Supabase dashboard so only Hudson Montessori School remains in the
-- dropdown. (Reassign any classes that reference them first.)
