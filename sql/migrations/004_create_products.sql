-- =============================================================================
-- PRODUCTS (Produits)
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- IDENTIFICATION PRODUIT
    sku TEXT NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    description TEXT,

    -- RELATIONS
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- PRIX
    purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
    selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 20.00 CHECK (tax_rate >= 0),

    -- STOCK
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'piece',
    alert_threshold INTEGER DEFAULT 10 CHECK (alert_threshold >= 0),
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,

    -- CARACTERISTIQUES PHYSIQUES
    weight DECIMAL(10,2) CHECK (weight >= 0),
    dimensions TEXT,

    -- ORGANISATION
    location TEXT,
    tags TEXT[],
    images TEXT[],

    -- STATUS
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'draft', 'archived')),
    is_available BOOLEAN NOT NULL DEFAULT true,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- CHECK GLOBAL
    CHECK (
        max_quantity IS NULL
        OR max_quantity >= min_quantity
    )
);

-- =============================================================================
-- INDEX
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique
    ON products(sku);

CREATE INDEX IF NOT EXISTS idx_products_name
    ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_category
    ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_supplier
    ON products(supplier_id);

CREATE INDEX IF NOT EXISTS idx_products_status
    ON products(status);

CREATE INDEX IF NOT EXISTS idx_products_quantity
    ON products(quantity);