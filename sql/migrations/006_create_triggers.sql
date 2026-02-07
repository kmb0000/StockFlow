-- =============================================================================
-- FONCTION : Mettre à jour updated_at automatiquement
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

    --TRIGGER POUR users
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    --TRIGGER POUR categories
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    --TRIGGER POUR suppliers
    CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    --TRIGGER POUR products
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FONCTION : Mettre à jour le stock après un mouvement.
-- =============================================================================
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
    --DECLARE pour ajouter une variable local ici current_stock
DECLARE
  current_stock INTEGER;
BEGIN
  -- Récupérer le stock actuel avec VERROUILLAGE
  SELECT quantity INTO STRICT current_stock
  FROM products
  WHERE id = NEW.product_id
  FOR UPDATE;  ← Protection contre la concurrence
  
  -- SI c'est une SORTIE
  IF NEW.type = 'OUT' THEN
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Stock insuffisant : disponible=%, demandé=%', current_stock, NEW.quantity;
    END IF;
    
    UPDATE products
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
  
  -- SI c'est une ENTRÉE
  ELSIF NEW.type = 'IN' THEN
    UPDATE products
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.product_id;
  
  -- SI c'est un AJUSTEMENT
  ELSIF NEW.type = 'ADJUSTMENT' THEN
    IF NEW.quantity < 0 THEN
      RAISE EXCEPTION 'Ajustement invalide : quantité=% (doit être >= 0)', NEW.quantity;
    END IF;
    
    UPDATE products
    SET quantity = NEW.quantity
    WHERE id = NEW.product_id;
  
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

    -- TRIGGER pour mettre à jour le stock
    CREATE TRIGGER update_stock_on_movement
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();