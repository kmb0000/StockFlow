-- =============================================================================
-- SUPPLIERS (Fournisseurs)
-- =============================================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    --CONTACT
    email TEXT,
    phone TEXT,
    contact_person TEXT,
    --ADRESSE
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'France',
    website TEXT,
    notes TEXT,
    --META DONNEES
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEX pour optimiser les recherches
-- =============================================================================
CREATE INDEX idx_suppliers_name ON suppliers(name);