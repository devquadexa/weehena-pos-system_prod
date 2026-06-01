-- ============================================
-- ADD TEST USERS TO YOUR DATABASE
-- ============================================
-- Copy this entire query and paste it into Supabase SQL Editor
-- Then click Run

INSERT INTO public.users (username, password, role) VALUES
('admin', 'admin123', 'ADMIN'),
('cashier', 'cashier123', 'CASHIER'),
('manager', 'manager123', 'MANAGER');

-- ============================================
-- VERIFY USERS WERE ADDED
-- ============================================
-- Run this query to verify:

SELECT * FROM public.users;

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Use these to login:
-- 
-- Username: admin
-- Password: admin123
-- Role: ADMIN
--
-- Username: cashier
-- Password: cashier123
-- Role: CASHIER
--
-- Username: manager
-- Password: manager123
-- Role: MANAGER
