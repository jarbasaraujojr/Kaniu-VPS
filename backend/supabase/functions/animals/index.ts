import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  CreateAnimalRequest,
  UpdateAnimalRequest,
  AnimalResponse,
  ApiError
} from '../_shared/types.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

async function handleCreateAnimal(req: CreateAnimalRequest): Promise<AnimalResponse> {
  const { error: insertError, data: animal } = await supabase
    .from('animals')
    .insert({
      name: req.name,
      description: req.description,
      species_id: req.species_id,
      breed_id: req.breed_id,
      gender: req.gender,
      size: req.size,
      birth_date: req.birth_date,
      shelter_id: req.shelter_id,
      status: 'available'
    })
    .select('*')
    .single()

  if (insertError) {
    throw { code: 'INSERT_ERROR', message: 'Erro ao criar animal', details: insertError }
  }

  if (req.appearance) {
    // Insere aparência
    const { error: appearanceError } = await supabase
      .from('animal_appearances')
      .insert({
        animal_id: animal.id,
        fur_type_id: req.appearance.fur_type_id,
        pattern_id: req.appearance.pattern_id
      })

    if (appearanceError) {
      throw { code: 'APPEARANCE_ERROR', message: 'Erro ao salvar aparência', details: appearanceError }
    }

    // Insere cores
    if (req.appearance.colors?.length) {
      const colorInserts = req.appearance.colors.map(color_id => ({
        animal_id: animal.id,
        color_id
      }))

      const { error: colorsError } = await supabase
        .from('animal_colors')
        .insert(colorInserts)

      if (colorsError) {
        throw { code: 'COLORS_ERROR', message: 'Erro ao salvar cores', details: colorsError }
      }
    }
  }

  // Busca dados completos do animal
  const { data: fullAnimal, error: fetchError } = await supabase
    .from('animals')
    .select(`
      *,
      shelter:shelters(*),
      appearance:animal_appearances(
        *,
        colors:animal_colors(*)
      )
    `)
    .eq('id', animal.id)
    .single()

  if (fetchError) {
    throw { code: 'FETCH_ERROR', message: 'Erro ao buscar dados completos', details: fetchError }
  }

  return fullAnimal as AnimalResponse
}

async function handleUpdateAnimal(req: UpdateAnimalRequest): Promise<AnimalResponse> {
  const { id, appearance, ...updateData } = req

  // Atualiza dados básicos do animal
  const { error: updateError } = await supabase
    .from('animals')
    .update(updateData)
    .eq('id', id)

  if (updateError) {
    throw { code: 'UPDATE_ERROR', message: 'Erro ao atualizar animal', details: updateError }
  }

  if (appearance) {
    // Atualiza aparência
    const { error: appearanceError } = await supabase
      .from('animal_appearances')
      .upsert({
        animal_id: id,
        fur_type_id: appearance.fur_type_id,
        pattern_id: appearance.pattern_id
      })

    if (appearanceError) {
      throw { code: 'APPEARANCE_ERROR', message: 'Erro ao atualizar aparência', details: appearanceError }
    }

    // Atualiza cores (remove todas e insere novamente)
    if (appearance.colors) {
      await supabase
        .from('animal_colors')
        .delete()
        .eq('animal_id', id)

      const colorInserts = appearance.colors.map(color_id => ({
        animal_id: id,
        color_id
      }))

      const { error: colorsError } = await supabase
        .from('animal_colors')
        .insert(colorInserts)

      if (colorsError) {
        throw { code: 'COLORS_ERROR', message: 'Erro ao atualizar cores', details: colorsError }
      }
    }
  }

  // Busca dados completos do animal
  const { data: animal, error: fetchError } = await supabase
    .from('animals')
    .select(`
      *,
      shelter:shelters(*),
      appearance:animal_appearances(
        *,
        colors:animal_colors(*)
      )
    `)
    .eq('id', id)
    .single()

  if (fetchError) {
    throw { code: 'FETCH_ERROR', message: 'Erro ao buscar dados completos', details: fetchError }
  }

  return animal as AnimalResponse
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method, url } = req
    const requestData = await req.json()

    let result: AnimalResponse

    if (method === 'POST') {
      result = await handleCreateAnimal(requestData as CreateAnimalRequest)
    } else if (method === 'PUT') {
      result = await handleUpdateAnimal(requestData as UpdateAnimalRequest)
    } else {
      throw { code: 'METHOD_NOT_ALLOWED', message: 'Método não permitido' }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Erro desconhecido',
      details: error.details
    }

    return new Response(
      JSON.stringify(apiError),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})