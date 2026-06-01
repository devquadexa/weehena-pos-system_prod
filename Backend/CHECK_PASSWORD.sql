-- Check the exact password stored in database
-- Run this in Supabase SQL Editor

-- See the password with length
SELECT 
  id,
  username,
  password,
  LENGTH(password) as password_length,
  role
FROM public.users
WHERE username = 'admin';

-- See the password in hex (to see hidden characters)
SELECT 
  username,
  password,
  encode(password::bytea, 'hex') as password_hex
FROM public.users
WHERE username = 'admin';

-- Check all users
SELECT * FROM public.users;
