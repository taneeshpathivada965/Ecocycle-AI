-- EcoCycle AI: Circular Economy E-Waste Diagnostic & Intelligent Routing Platform
-- Migration 001: Core Database Schema, Constraints, Indexes & RLS Policies

-- Enable cryptographic UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Utility function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_currency TEXT NOT NULL DEFAULT 'INR' CHECK (preferred_currency IN ('INR', 'USD')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, preferred_currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'EcoCycle User'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'INR')
    )
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.eco_wallets (user_id, balance, total_co2_saved_kg, total_ewaste_diverted_kg)
    VALUES (NEW.id, 100, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 2. Table: devices
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('smartphone', 'laptop', 'tablet', 'smartwatch', 'monitor', 'desktop', 'gaming_console', 'other')),
    brand TEXT,
    model TEXT,
    generation TEXT,
    image_url TEXT,
    condition TEXT CHECK (condition IN ('A', 'B', 'C', 'BROKEN', 'WORKING', 'REPAIRABLE', 'DEAD', 'UNKNOWN')),
    repairability TEXT,
    working_status TEXT CHECK (working_status IN ('WORKING', 'PARTIALLY_WORKING', 'NON_WORKING', 'DEAD')),
    identification_confidence NUMERIC CHECK (identification_confidence >= 0 AND identification_confidence <= 1),
    estimated_age_years NUMERIC CHECK (estimated_age_years >= 0),
    storage_capacity TEXT,
    ram_capacity TEXT,
    user_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_category ON public.devices(category);

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Table: diagnostics
CREATE TABLE IF NOT EXISTS public.diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    battery_health NUMERIC CHECK (battery_health >= 0 AND battery_health <= 100),
    battery_cycles NUMERIC CHECK (battery_cycles >= 0),
    display_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    touch_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    storage_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    processor_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    charging_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    camera_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    speaker_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    overall_score NUMERIC NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    source TEXT NOT NULL CHECK (source IN ('AI_ESTIMATED', 'USER_REPORTED', 'BROWSER_TESTED', 'DEVICE_VERIFIED', 'SIMULATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_device_id ON public.diagnostics(device_id);

-- 4. Table: valuations
CREATE TABLE IF NOT EXISTS public.valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    valuation_type TEXT NOT NULL CHECK (valuation_type IN ('RESALE', 'SCRAP', 'REPAIR_ESTIMATE')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    explanation TEXT,
    source TEXT NOT NULL DEFAULT 'MARKET_ALGORITHM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_valuations_device_id ON public.valuations(device_id);

-- 5. Table: decisions
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    recommended_route TEXT NOT NULL CHECK (recommended_route IN ('RESALE', 'REPAIR', 'RECYCLE')),
    condition_score NUMERIC NOT NULL CHECK (condition_score >= 0 AND condition_score <= 100),
    repairability_score NUMERIC NOT NULL CHECK (repairability_score >= 0 AND repairability_score <= 100),
    resale_value NUMERIC NOT NULL DEFAULT 0,
    scrap_value NUMERIC NOT NULL DEFAULT 0,
    repair_cost_estimate NUMERIC NOT NULL DEFAULT 0,
    explanation TEXT NOT NULL,
    alternative_route TEXT CHECK (alternative_route IN ('RESALE', 'REPAIR', 'RECYCLE', NULL)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_device_id ON public.decisions(device_id);

-- 6. Table: partners
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('MARKETPLACE', 'REFURBISHER', 'RECYCLER', 'DROP_OFF')),
    description TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    phone TEXT,
    email TEXT,
    website TEXT,
    certified BOOLEAN NOT NULL DEFAULT FALSE,
    certification_standard TEXT,
    supported_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC DEFAULT 4.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_certified ON public.partners(certified);

-- 7. Table: matches
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('RESALE', 'REPAIR', 'RECYCLE')),
    match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    estimated_value NUMERIC NOT NULL DEFAULT 0,
    distance_km NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_device_id ON public.matches(device_id);
CREATE INDEX IF NOT EXISTS idx_matches_partner_id ON public.matches(partner_id);

-- 8. Table: sanitization_records
CREATE TABLE IF NOT EXISTS public.sanitization_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('NIST_CLEAR', 'NIST_PURGE', 'NIST_DESTROY', 'FACTORY_RESET_ENCRYPTED', 'SECURE_ERASE')),
    standard TEXT NOT NULL DEFAULT 'NIST SP 800-88 Rev 1',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'CONFIRMED', 'FAILED')),
    verification_type TEXT NOT NULL CHECK (verification_type IN ('USER_CONFIRMED', 'GUIDED', 'SIMULATED', 'VERIFIED')),
    confirmation_timestamp TIMESTAMPTZ,
    certificate_hash TEXT,
    checklist_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sanitization_device_id ON public.sanitization_records(device_id);

-- 9. Table: certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    sanitization_id UUID REFERENCES public.sanitization_records(id) ON DELETE SET NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    certificate_hash TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('ISSUED', 'VERIFIED', 'REVOKED')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_device_id ON public.certificates(device_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);

-- 10. Table: eco_wallets
CREATE TABLE IF NOT EXISTS public.eco_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0,
    total_co2_saved_kg NUMERIC NOT NULL DEFAULT 0,
    total_ewaste_diverted_kg NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_eco_wallets_updated_at
    BEFORE UPDATE ON public.eco_wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Table: eco_transactions
CREATE TABLE IF NOT EXISTS public.eco_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.eco_wallets(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEVICE_SCANNED', 'RESALE_COMPLETED', 'REPAIR_INITIATED', 'RECYCLING_COMPLETED', 'SANITIZATION_VERIFIED', 'ECO_REWARD_REDEEMED')),
    credits NUMERIC NOT NULL,
    co2_saved_kg NUMERIC NOT NULL DEFAULT 0,
    ewaste_diverted_kg NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eco_transactions_wallet_id ON public.eco_transactions(wallet_id);

-- Seed initial certified circular economy partners
INSERT INTO public.partners (name, partner_type, description, latitude, longitude, address, city, certified, certification_standard, supported_categories)
VALUES 
('GreenTech Certified E-Waste Recycler', 'RECYCLER', 'R2 & e-Stewards certified e-waste recovery facility with 98.4% material extraction efficiency.', 12.9716, 77.5946, 'Plot 42, Electronic City Phase 1', 'Bengaluru', true, 'R2v3 / ISO 14001', '["smartphone", "laptop", "tablet", "desktop", "monitor"]'::jsonb),
('Cashify Trade-In Hub', 'MARKETPLACE', 'Premier instant trade-in provider offering doorstep pickup and guaranteed instant valuation payouts.', 12.9352, 77.6245, '100 Feet Road, Koramangala', 'Bengaluru', true, 'ISO 9001 Refurbished', '["smartphone", "laptop", "tablet", "smartwatch"]'::jsonb),
('CircularTech Authorized Refurbishers', 'REFURBISHER', 'Expert component-level micro-soldering, display lamination, and battery revival lab.', 12.9784, 77.6408, 'Indiranagar 12th Main', 'Bengaluru', true, 'IPC-A-610 Certified', '["laptop", "smartphone", "gaming_console", "desktop"]'::jsonb),
('E-Cycle Clean Earth Drop-off Station', 'DROP_OFF', 'Zero-landfill municipal e-waste collection bin with hazardous lithium containment.', 12.9279, 77.6271, 'BTM Layout 2nd Stage', 'Bengaluru', true, 'CPCB Registered', '["smartphone", "smartwatch", "other", "tablet"]'::jsonb),
('EcoRecycle International Mumbai Hub', 'RECYCLER', 'State-of-the-art precious metal extraction refinery (gold, copper, silver hydrometallurgy).', 19.0760, 72.8777, 'MIDC Industrial Area, Andheri East', 'Mumbai', true, 'e-Stewards / R2v3', '["smartphone", "laptop", "desktop", "monitor", "gaming_console"]'::jsonb),
('RenewGadget Delhi Refurbishment Center', 'REFURBISHER', 'Specialized enterprise device testing, battery re-celling, and certified resale marketplace.', 28.6139, 77.2090, 'Nehru Place IT Market', 'New Delhi', true, 'ISO 14001 / BIS', '["laptop", "desktop", "smartphone", "monitor"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanitization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users read & update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Devices: user owned
CREATE POLICY "Users can view own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.devices FOR DELETE USING (auth.uid() = user_id);

-- Diagnostics: user through device
CREATE POLICY "Users can view diagnostics of own devices" ON public.diagnostics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = diagnostics.device_id AND devices.user_id = auth.uid())
);

-- Valuations: user through device
CREATE POLICY "Users can view valuations of own devices" ON public.valuations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = valuations.device_id AND devices.user_id = auth.uid())
);

-- Decisions: user through device
CREATE POLICY "Users can view decisions of own devices" ON public.decisions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = decisions.device_id AND devices.user_id = auth.uid())
);

-- Partners: public read for active partners
CREATE POLICY "Anyone can view active partners" ON public.partners FOR SELECT USING (active = true);

-- Matches: user through device
CREATE POLICY "Users can view matches of own devices" ON public.matches FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = matches.device_id AND devices.user_id = auth.uid())
);

-- Sanitization Records: user through device
CREATE POLICY "Users can view sanitization records of own devices" ON public.sanitization_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = sanitization_records.device_id AND devices.user_id = auth.uid())
);
CREATE POLICY "Users can insert sanitization records of own devices" ON public.sanitization_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = sanitization_records.device_id AND devices.user_id = auth.uid())
);

-- Certificates: readable by device owner or public lookup by certificate number
CREATE POLICY "Users can view certificates of own devices" ON public.certificates FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.devices WHERE devices.id = certificates.device_id AND devices.user_id = auth.uid())
    OR verification_status = 'ISSUED'
);

-- Eco Wallets: users view own wallet
CREATE POLICY "Users can view own eco wallet" ON public.eco_wallets FOR SELECT USING (auth.uid() = user_id);

-- Eco Transactions: user through wallet
CREATE POLICY "Users can view own eco transactions" ON public.eco_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.eco_wallets WHERE eco_wallets.id = eco_transactions.wallet_id AND eco_wallets.user_id = auth.uid())
);
