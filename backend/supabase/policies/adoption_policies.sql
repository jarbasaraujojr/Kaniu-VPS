-- Policies para a tabela adoptions
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver seus próprios pedidos de adoção
CREATE POLICY "Usuários podem ver seus próprios pedidos de adoção"
ON adoptions FOR SELECT
TO authenticated
USING (
  auth.uid() = adopter_id OR 
  EXISTS (
    SELECT 1 FROM shelters 
    WHERE shelters.id = adoptions.shelter_id 
    AND shelters.owner_id = auth.uid()
  )
);

-- Usuários podem criar pedidos de adoção
CREATE POLICY "Usuários podem criar pedidos de adoção"
ON adoptions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = adopter_id AND
  EXISTS (
    SELECT 1 FROM animals 
    WHERE animals.id = animal_id 
    AND animals.status = 'available'
  )
);

-- Donos de abrigos podem atualizar pedidos dos seus abrigos
CREATE POLICY "Donos de abrigos podem atualizar pedidos"
ON adoptions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shelters 
    WHERE shelters.id = adoptions.shelter_id 
    AND shelters.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shelters 
    WHERE shelters.id = adoptions.shelter_id 
    AND shelters.owner_id = auth.uid()
  )
);

-- Usuários podem cancelar seus próprios pedidos pendentes
CREATE POLICY "Usuários podem cancelar seus pedidos pendentes"
ON adoptions FOR UPDATE
TO authenticated
USING (
  auth.uid() = adopter_id AND 
  status = 'pending' AND 
  NEW.status = 'cancelled'
)
WITH CHECK (
  auth.uid() = adopter_id AND 
  status = 'pending' AND 
  NEW.status = 'cancelled'
);