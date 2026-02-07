-- =============================================================================
-- TABLE: USERS
-- =============================================================================
CREATE TABLE users (
    /* ID unique des users (clé primaire) identifiant universel unique (genre : a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)*/
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    /* Email doit être unique, pas deux users avec le même email */
  email TEXT NOT NULL,

  /* Nom complet */
  name TEXT NOT NULL,

  /* Mot de passe hashé */
  password_hash TEXT NOT NULL,

  /* Rôle de l'utilisateur (ADMIN, MANAGER, EMPLOYEE) */
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),

  /* URL de l'avatar (optionnel) */
  avatar_url TEXT,

  /* Compte actif ou désactivé */
  is_active BOOLEAN NOT NULL DEFAULT true,

  /* Date de création (automatique) */
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  /* Date de dernière modification (automatique) */
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEX pour optimiser les recherches
-- =============================================================================

/* Index sur email (recherche case-insensitive pour le login) */
CREATE UNIQUE INDEX idx_users_email_unique ON users(LOWER(email));

/* Index sur role (filtrage par rôle) */
CREATE INDEX idx_users_role ON users(role);