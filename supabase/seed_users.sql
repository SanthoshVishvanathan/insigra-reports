=

-- 1. Link alpha@test.com to "Alpha Ltd"
insert into public.profiles (id, company_name)
select id, 'Alpha Ltd'
from auth.users
where email = 'alpha@test.com'
on conflict (id) do update set company_name = 'Alpha Ltd';

-- 2. Link beta@test.com to "Beta Ltd"
insert into public.profiles (id, company_name)
select id, 'Beta Ltd'
from auth.users
where email = 'beta@test.com'
on conflict (id) do update set company_name = 'Beta Ltd';

-- 3. Verification Check 
select 
  p.id as profile_user_id,
  u.email,
  p.company_name,
  p.created_at
from public.profiles p
join auth.users u on u.id = p.id;
