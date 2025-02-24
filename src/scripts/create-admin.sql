-- Admin kullanıcısını auth.users tablosuna ekle
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'turalxaricde',
  crypt('resadxaricde', gen_salt('bf')),
  now(),
  jsonb_build_object('username', 'turalxaricde'),
  now(),
  now()
)
RETURNING id;

-- Kullanıcıyı public.users tablosuna admin rolüyle ekle
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  created_at
)
SELECT
  id,
  'turalxaricde',
  'Tural Admin',
  'admin',
  now()
FROM auth.users
WHERE email = 'turalxaricde'; 