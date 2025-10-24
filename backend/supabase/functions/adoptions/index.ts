import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  CreateAdoptionRequest,
  UpdateAdoptionRequest,
  AdoptionResponse,
  ApiError,
  AdoptionStatus
} from '../_shared/types.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

async function handleCreateAdoption(req: CreateAdoptionRequest, userId: string): Promise<AdoptionResponse> {
  // Busca o animal para verificar o shelter_id
  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .select('shelter_id, status')
    .eq('id', req.animal_id)
    .single()

  if (animalError) {
    throw { code: 'FETCH_ERROR', message: 'Animal não encontrado', details: animalError }
  }

  if (animal.status !== 'available') {
    throw { code: 'INVALID_STATUS', message: 'Animal não está disponível para adoção' }
  }

  // Cria o pedido de adoção
  const { error: insertError, data: adoption } = await supabase
    .from('adoptions')
    .insert({
      animal_id: req.animal_id,
      adopter_id: userId,
      shelter_id: animal.shelter_id,
      message: req.message,
      status: 'pending'
    })
    .select(`
      *,
      animal:animals(*),
      adopter:profiles(*),
      shelter:shelters(*)
    `)
    .single()

  if (insertError) {
    throw { code: 'INSERT_ERROR', message: 'Erro ao criar pedido de adoção', details: insertError }
  }

  return adoption as AdoptionResponse
}

async function handleUpdateAdoption(req: UpdateAdoptionRequest, userId: string): Promise<AdoptionResponse> {
  // Verifica se o usuário tem permissão (dono do abrigo)
  const { data: adoption, error: fetchError } = await supabase
    .from('adoptions')
    .select(`
      *,
      shelter:shelters(owner_id)
    `)
    .eq('id', req.id)
    .single()

  if (fetchError) {
    throw { code: 'FETCH_ERROR', message: 'Pedido de adoção não encontrado', details: fetchError }
  }

  if (adoption.shelter.owner_id !== userId) {
    throw { code: 'UNAUTHORIZED', message: 'Sem permissão para atualizar este pedido' }
  }

  // Se aprovado, atualiza o status do animal
  if (req.status === AdoptionStatus.Approved) {
    const { error: animalError } = await supabase
      .from('animals')
      .update({ status: 'adopted' })
      .eq('id', adoption.animal_id)

    if (animalError) {
      throw { code: 'UPDATE_ERROR', message: 'Erro ao atualizar status do animal', details: animalError }
    }
  }

  // Atualiza o pedido
  const { error: updateError } = await supabase
    .from('adoptions')
    .update({
      status: req.status,
      message: req.message
    })
    .eq('id', req.id)

  if (updateError) {
    throw { code: 'UPDATE_ERROR', message: 'Erro ao atualizar pedido', details: updateError }
  }

  // Busca dados atualizados
  const { data: updated, error: refetchError } = await supabase
    .from('adoptions')
    .select(`
      *,
      animal:animals(*),
      adopter:profiles(*),
      shelter:shelters(*)
    `)
    .eq('id', req.id)
    .single()

  if (refetchError) {
    throw { code: 'FETCH_ERROR', message: 'Erro ao buscar dados atualizados', details: refetchError }
  }

  return updated as AdoptionResponse
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verifica autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw { code: 'UNAUTHORIZED', message: 'Token não fornecido' }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw { code: 'UNAUTHORIZED', message: 'Token inválido', details: authError }
    }

    const { method } = req
    const requestData = await req.json()
    let result: AdoptionResponse

    if (method === 'POST') {
      result = await handleCreateAdoption(requestData as CreateAdoptionRequest, user.id)
    } else if (method === 'PUT') {
      result = await handleUpdateAdoption(requestData as UpdateAdoptionRequest, user.id)
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
        status: error.code === 'UNAUTHORIZED' ? 401 : 400,
      },
    )
  }
})