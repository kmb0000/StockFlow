CREATE TYPE entity_type_enum AS ENUM (
  'PRODUCT',
  'CATEGORY',
  'SUPPLIER',
  'STOCK_MOVEMENT',
  'USER'
);

CREATE TYPE activity_action_enum AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'VALIDATE',
  'REJECT',
  'LOGIN',
  'LOGOUT'
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  action activity_action_enum NOT NULL,
  entity_type entity_type_enum NOT NULL,
  entity_id UUID,

  details JSONB,

  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);