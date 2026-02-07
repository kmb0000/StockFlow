-- =============================================================================
-- CATEGORIES (Catégories de produits)
-- =============================================================================

CREATE TABLE categories (
    -- ID unique pour categories(identifiant universel)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- name unique 
    name TEXT NOT NULL,

    --description (facultatif) texte libre
    description TEXT,

    -- Données UI une categorie à une couleur et une icône
    color TEXT NOT NULL DEFAULT '#0066FF',

    icon TEXT NOT NULL DEFAULT '📦',

    -- DATES
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_categories_name_unique ON categories(LOWER(name));