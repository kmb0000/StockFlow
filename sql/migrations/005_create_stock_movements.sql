-- =============================================================================
-- STOCK_MOVEMENTS (mouvements des stocks)
-- =============================================================================

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    --RELATIONS PRODUIT
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    --TYPE DE MOUVEMENT
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),

    --QUANTITE
    quantity INTEGER NOT NULL CHECK (quantity >= 0),

    --RAISON ET DETAILS
    reason TEXT NOT NULL,
    notes TEXT,
    reference TEXT,

    --PRIX UNITAIRE AU MOMENT DU MOUVEMENT
    unit_price DECIMAL(10,2) CHECK (unit_price >= 0),

    --UTILISATEURS
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMPTZ,

    --METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    --CHECK
  CHECK (
  (validated_by IS NULL AND validated_at IS NULL)
  OR
  (validated_by IS NOT NULL AND validated_at IS NOT NULL)
)
);

-- =============================================================================
-- INDEX pour optimiser les recherches
-- =============================================================================

CREATE INDEX idx_stock_movement_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movement_type ON stock_movements(type);
CREATE INDEX idx_stock_movement_created_by ON stock_movements(created_by);
CREATE INDEX idx_stock_movement_validated_by ON stock_movements(validated_by);
CREATE INDEX idx_stock_movement_created_at ON stock_movements(created_at DESC);