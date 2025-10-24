import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import AdoptionsList from '../../components/animals/AdoptionsList'

export default function AdoptionsPage() {
  const [user, setUser] = useState(null)
  const [shelter, setShelter] = useState(null)

  useEffect(() => {
    // Busca o usuário atual
    const user = supabase.auth.user()
    if (user) {
      setUser(user)
      fetchShelter(user.id)
    }
  }, [])

  const fetchShelter = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('owner_id', userId)
        .single()

      if (error) throw error
      setShelter(data)
    } catch (error) {
      console.error('Error fetching shelter:', error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Faça login para ver suas adoções
          </h2>
          {/* Adicionar botão de login aqui */}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {shelter ? 'Pedidos de Adoção do Abrigo' : 'Minhas Solicitações de Adoção'}
      </h1>

      <AdoptionsList isShelter={!!shelter} />
    </div>
  )
}