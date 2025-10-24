-- ========================================
-- EXTENSÕES
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

CREATE TABLE animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  description text,
  species_id int REFERENCES catalogs(id),
  breed_id int REFERENCES catalogs(id),
  gender varchar(10) CHECK (gender IN ('Macho', 'Fêmea', 'Indefinido')),
  size varchar(20),
  birth_date date,
  shelter_id uuid REFERENCES shelters(id),
  status varchar(20) DEFAULT 'available' CHECK (status IN ('available','adopted','hospitalized','lost','deceased')),
  profile_picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Trigger para atualização automática de updated_at
CREATE TRIGGER set_timestamp_animals
  BEFORE UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Índices para melhorar performance
CREATE INDEX idx_animals_shelter ON animals(shelter_id);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_species_breed ON animals(species_id, breed_id) WHERE deleted_at IS NULL;

CREATE TABLE shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  owner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE adoptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  adopter_id uuid REFERENCES users(id),
  shelter_id uuid REFERENCES shelters(id),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'regular_user' CHECK (role IN ('admin', 'shelter_admin', 'regular_user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Trigger para atualização automática de updated_at
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ========================================
-- DADOS RELACIONADOS
-- ========================================

CREATE TABLE animal_weights (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  animal_id uuid REFERENCES animals(id),
  value numeric(5,2) NOT NULL,
  recorded_by uuid REFERENCES users(id),
  date_time timestamptz DEFAULT now()
);

CREATE TABLE animal_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  image_url text NOT NULL,
  is_profile_pic boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE animal_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  reporter_id uuid REFERENCES users(id),
  report_type varchar(20) CHECK (report_type IN ('lost','found')),
  location jsonb, -- { "lat": -23.5, "lng": -46.6 }
  description text,
  matched_report_id uuid REFERENCES reports(id),
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_favorites (
  user_id uuid REFERENCES users(id),
  animal_id uuid REFERENCES animals(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, animal_id)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action varchar NOT NULL,
  table_name varchar NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índice para melhorar consultas de auditoria
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ========================================
-- CARACTERÍSTICAS DOS ANIMAIS
-- ========================================

CREATE TABLE animal_appearances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  fur_type_id int REFERENCES catalogs(id),
  pattern_id int REFERENCES catalogs(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE animal_colors (
  animal_id uuid REFERENCES animals(id),
  color_id int REFERENCES catalogs(id),
  PRIMARY KEY (animal_id, color_id)
);

-- ========================================
-- SAÚDE E AVALIAÇÕES
-- ========================================

CREATE TABLE immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  vaccine_id int REFERENCES catalogs(id),
  application_date timestamptz NOT NULL,
  next_application_date timestamptz,
  notes text,
  applied_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_immunizations_animal ON immunizations(animal_id);
CREATE INDEX idx_immunizations_date ON immunizations(application_date);

CREATE TABLE treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  treatment_type_id int REFERENCES catalogs(id),
  medication_id int REFERENCES catalogs(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  dose numeric(5,2),
  dose_unit varchar(10),
  frequency varchar(50),
  notes text,
  prescribed_by uuid REFERENCES users(id),
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_treatments_animal ON treatments(animal_id);
CREATE INDEX idx_treatments_dates ON treatments(start_date, end_date);

CREATE TABLE evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  evaluator_id uuid REFERENCES users(id),
  evaluation_date timestamptz NOT NULL,
  health_score int CHECK (health_score BETWEEN 1 AND 5),
  behavior_score int CHECK (behavior_score BETWEEN 1 AND 5),
  sociability_score int CHECK (sociability_score BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_evaluations_animal ON evaluations(animal_id);

CREATE TABLE animal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  event_type varchar(50) NOT NULL,
  event_date timestamptz NOT NULL,
  description text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_animal ON animal_events(animal_id);
CREATE INDEX idx_events_type_date ON animal_events(event_type, event_date);

-- ========================================
-- POLÍTICAS DE SEGURANÇA
-- ========================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso
CREATE POLICY shelter_animals ON animals
    FOR ALL
    TO shelter_admin
    USING (shelter_id IN (
        SELECT id FROM shelters WHERE owner_id = current_user::uuid
    ));

CREATE POLICY user_view_animals ON animals
    FOR SELECT
    TO PUBLIC
    USING (status = 'available' OR id IN (
        SELECT animal_id FROM adoptions WHERE adopter_id = current_user::uuid
    ));

-- ========================================
-- CATÁLOGOS GENÉRICOS
-- ========================================

CREATE TABLE catalogs (
  id serial PRIMARY KEY,
  category varchar NOT NULL,
  name varchar NOT NULL,
  CONSTRAINT catalogs_category_check CHECK (category IN (
    'species',    -- Espécies de animais
    'breed',      -- Raças
    'fur_type',   -- Tipos de pelagem
    'pattern',    -- Padrões de pelagem
    'color',      -- Cores
    'size',       -- Portes
    'vaccine',    -- Tipos de vacinas
    'treatment',  -- Tipos de tratamentos
    'medication'  -- Medicamentos
  ))
);
