-- =============================================================================
-- STOCK_MOVEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- RELATIONS
    product_id UUID NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,

    created_by UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    validated_by UUID
        REFERENCES users(id),

    -- INFORMATIONS MOUVEMENT
    type TEXT NOT NULL
        CHECK (type IN ('IN', 'OUT')),

    quantity INTEGER NOT NULL
        CHECK (quantity >= 0),

    reason TEXT NOT NULL,
    notes TEXT,
    reference TEXT,

    unit_price NUMERIC(10,2)
        CHECK (unit_price >= 0),

    -- VALIDATION
    validated_at TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'VALIDATED', 'REJECTED')),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- CHECK GLOBAL VALIDATION
    CHECK (
        (validated_by IS NULL AND validated_at IS NULL)
        OR
        (validated_by IS NOT NULL AND validated_at IS NOT NULL)
    )
);

-- =============================================================================
-- INDEX
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_stock_movement_product_id
    ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_movement_created_by
    ON stock_movements(created_by);

CREATE INDEX IF NOT EXISTS idx_stock_movement_validated_by
    ON stock_movements(validated_by);

CREATE INDEX IF NOT EXISTS idx_stock_movement_type
    ON stock_movements(type);

CREATE INDEX IF NOT EXISTS idx_stock_movement_created_at
    ON stock_movements(created_at DESC);