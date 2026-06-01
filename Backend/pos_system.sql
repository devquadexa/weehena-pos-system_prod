-- PostgreSQL POS System Database Backup
-- Converted to SQL format for Supabase import
-- Database: pos_db
-- PostgreSQL Version: 18.3

SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';
SELECT pg_catalog.set_config('search_path', '', false);

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.sale_item CASCADE;
DROP TABLE IF EXISTS public.sale CASCADE;
DROP TABLE IF EXISTS public.stock_history CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.product CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id bigint NOT NULL,
    password character varying(255),
    role character varying(255),
    username character varying(255)
);

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Create product table
CREATE TABLE public.product (
    id bigint NOT NULL,
    barcode character varying(255) NOT NULL,
    bulk_price double precision,
    name character varying(255),
    pack_price double precision,
    price_per_kg double precision NOT NULL,
    retail_price double precision,
    weighted boolean NOT NULL
);

CREATE SEQUENCE public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);
ALTER TABLE ONLY public.product ADD CONSTRAINT product_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.product ADD CONSTRAINT uk44c6umvphppa3226vhmagmviu UNIQUE (barcode);

-- Create stock table
CREATE TABLE public.stock (
    id bigint NOT NULL,
    barcode character varying(255) NOT NULL,
    low_stock_threshold_qty integer NOT NULL,
    low_stock_threshold_weight double precision NOT NULL,
    outlet_id character varying(255),
    product_name character varying(255),
    quantity integer NOT NULL,
    weight double precision NOT NULL,
    weighted boolean NOT NULL
);

CREATE SEQUENCE public.stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.stock ALTER COLUMN id SET DEFAULT nextval('public.stock_id_seq'::regclass);
ALTER TABLE ONLY public.stock ADD CONSTRAINT stock_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.stock ADD CONSTRAINT uk5fsei468vp43xdc7xxunihdqy UNIQUE (barcode, outlet_id);

-- Create sale table
CREATE TABLE public.sale (
    id bigint NOT NULL,
    date timestamp(6) without time zone,
    discount_amount double precision NOT NULL,
    invoice_no character varying(255),
    outlet_id character varying(255),
    status character varying(255),
    total double precision NOT NULL,
    CONSTRAINT sale_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CANCELLED'::character varying])::text[])))
);

CREATE SEQUENCE public.sale_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.sale ALTER COLUMN id SET DEFAULT nextval('public.sale_id_seq'::regclass);
ALTER TABLE ONLY public.sale ADD CONSTRAINT sale_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sale ADD CONSTRAINT uk5qb6ymafdnbkt4vged1c11sb6 UNIQUE (invoice_no);

-- Create sale_item table
CREATE TABLE public.sale_item (
    id bigint NOT NULL,
    barcode character varying(255),
    price_type character varying(255),
    value double precision NOT NULL,
    invoice_no character varying(255),
    CONSTRAINT sale_item_price_type_check CHECK (((price_type)::text = ANY ((ARRAY['RETAIL'::character varying, 'BULK'::character varying, 'PACK'::character varying])::text[])))
);

CREATE SEQUENCE public.sale_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.sale_item ALTER COLUMN id SET DEFAULT nextval('public.sale_item_id_seq'::regclass);
ALTER TABLE ONLY public.sale_item ADD CONSTRAINT sale_item_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sale_item ADD CONSTRAINT fkrqki3hk4xdenq2inebgpncypc FOREIGN KEY (invoice_no) REFERENCES public.sale(invoice_no);

-- Create stock_history table
CREATE TABLE public.stock_history (
    id bigint NOT NULL,
    barcode character varying(255),
    changed_at timestamp(6) without time zone,
    changed_by character varying(255),
    new_stock double precision NOT NULL,
    old_stock double precision NOT NULL,
    outlet_id character varying(255),
    product_name character varying(255),
    updated_stock double precision NOT NULL
);

CREATE SEQUENCE public.stock_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.stock_history ALTER COLUMN id SET DEFAULT nextval('public.stock_history_id_seq'::regclass);
ALTER TABLE ONLY public.stock_history ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);

-- Set sequence values
SELECT pg_catalog.setval('public.users_id_seq', 3, true);
SELECT pg_catalog.setval('public.product_id_seq', 9, true);
SELECT pg_catalog.setval('public.stock_id_seq', 30, true);
SELECT pg_catalog.setval('public.sale_id_seq', 3, true);
SELECT pg_catalog.setval('public.sale_item_id_seq', 7, true);
SELECT pg_catalog.setval('public.stock_history_id_seq', 9, true);
