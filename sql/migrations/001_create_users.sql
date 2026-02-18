-- =============================================================================
-- USERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- INFORMATIONS
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),

    avatar_url TEXT,

    -- STATUS
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEX
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
    ON users (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);