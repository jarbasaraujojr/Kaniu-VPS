-- Políticas de segurança para o Supabase

-- Políticas para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para shelters
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver abrigos"
  ON shelters FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Apenas admins do abrigo podem editar"
  ON shelters FOR UPDATE
  USING (owner_id = auth.uid());

-- Políticas para animals
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver animais disponíveis"
  ON animals FOR SELECT
  USING (
    status = 'available' 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins do abrigo podem gerenciar seus animais"
  ON animals FOR ALL
  USING (
    shelter_id IN (
      SELECT id FROM shelters 
      WHERE owner_id = auth.uid()
    )
  );

-- Políticas para adoptions
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias adoções"
  ON adoptions FOR SELECT
  USING (
    adopter_id = auth.uid() OR
    shelter_id IN (
      SELECT id FROM shelters 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem solicitar adoções"
  ON adoptions FOR INSERT
  WITH CHECK (
    adopter_id = auth.uid() AND
    status = 'pending'
  );

-- Políticas para favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus favoritos"
  ON favorites FOR ALL
  USING (user_id = auth.uid());

-- Políticas para lost_found_reports
ALTER TABLE lost_found_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver reports abertos"
  ON lost_found_reports FOR SELECT
  USING (status = 'open');

CREATE POLICY "Usuários podem criar reports"
  ON lost_found_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios reports"
  ON lost_found_reports FOR UPDATE
  USING (reporter_id = auth.uid());

-- Políticas para medical records
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins do abrigo podem gerenciar registros médicos"
  ON immunizations FOR ALL
  USING (
    animal_id IN (
      SELECT id FROM animals
      WHERE shelter_id IN (
        SELECT id FROM shelters
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Aplicar política similar para outras tabelas médicas
CREATE POLICY "Admins do abrigo podem gerenciar tratamentos"
  ON treatments FOR ALL
  USING (
    animal_id IN (
      SELECT id FROM animals
      WHERE shelter_id IN (
        SELECT id FROM shelters
        WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins do abrigo podem gerenciar avaliações"
  ON evaluations FOR ALL
  USING (
    animal_id IN (
      SELECT id FROM animals
      WHERE shelter_id IN (
        SELECT id FROM shelters
        WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins do abrigo podem gerenciar pesagens"
  ON animal_weights FOR ALL
  USING (
    animal_id IN (
      SELECT id FROM animals
      WHERE shelter_id IN (
        SELECT id FROM shelters
        WHERE owner_id = auth.uid()
      )
    )
  );