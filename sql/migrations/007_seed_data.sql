-- =============================================================================
-- DONNÉES DE DÉMO
-- =============================================================================


INSERT INTO users (email, name, password_hash, role) VALUES ('admin@stockflow.com', 'Admin Principal', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('manager@stockflow.com', 'Manager Stocks', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANAGER'),
  ('employee@stockflow.com', 'Employee Test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE');

-- CATÉGORIES
INSERT INTO categories (name, description, color, icon) VALUES ('Électronique', 'Appareils électroniques grand public', '#0066FF', '📱'),
  ('Informatique', 'Matériel informatique et ordinateurs', '#10B981', '💻'),
  ('Accessoires', 'Accessoires divers', '#F59E0B', '🎧'),
  ('Audio', 'Équipement audio et son', '#EF4444', '🔊');

-- FOURNISSEURS
INSERT INTO suppliers (name, email, phone, contact_person, address, city, postal_code) VALUES 
('TechSupply Co.', 'contact@techsupply.com', '+33 1 23 45 67 89', 'Jean Dupont', '15 rue de la Tech', 'Paris', '75001'),
  ('ElectroWare', 'info@electroware.fr', '+33 1 98 76 54 32', 'Marie Martin', '42 av de l''Innovation', 'Lyon', '69001'),
  ('GlobalParts', 'sales@globalparts.com', '+33 4 11 22 33 44', 'Pierre Bernard', '8 bd du Commerce', 'Marseille', '13001');