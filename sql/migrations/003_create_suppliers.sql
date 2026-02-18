-- =============================================================================
-- SUPPLIERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- INFORMATIONS GENERALES
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_person TEXT,

    -- ADRESSE
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'France',

    -- COMPLEMENT
    website TEXT,
    notes TEXT,

    -- STATUS
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEX
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_name_unique
    ON suppliers (LOWER(name));