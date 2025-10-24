import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { AdoptionStatus } from '../../utils/types'

export default function AdoptionsList({ isShelter }) {
  const [adoptions, setAdoptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdoptions()
  }, [])

  const fetchAdoptions = async () => {
    try {
      const { data, error } = await supabase
        .from('adoptions')
        .select(`
          *,
          animal:animals(*),
          adopter:profiles(*),
          shelter:shelters(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdoptions(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (adoptionId, newStatus, message = '') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/adoptions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({
          id: adoptionId,
          status: newStatus,
          message
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      // Atualiza a lista
      await fetchAdoptions()

      // Trigger success notification
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Status atualizado com sucesso!'
        }
      }))
    } catch (error) {
      setError(error.message)
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      {adoptions.map(adoption => (
        <div 
          key={adoption.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">
                {adoption.animal.name}
              </h3>
              <p className="text-gray-600">
                Solicitado por: {adoption.adopter.name}
              </p>
              <p className="text-gray-600">
                Abrigo: {adoption.shelter.name}
              </p>
              <p className="mt-2">
                {adoption.message}
              </p>
            </div>

            <div className="text-right">
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm
                ${getStatusColor(adoption.status)}
              `}>
                {getStatusLabel(adoption.status)}
              </span>
              
              <p className="text-sm text-gray-500 mt-1">
                {new Date(adoption.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {isShelter && adoption.status === AdoptionStatus.Pending && (
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => handleUpdateStatus(adoption.id, AdoptionStatus.Rejected)}
                className="px-4 py-2 text-red-600 hover:text-red-800"
              >
                Recusar
              </button>
              <button
                onClick={() => handleUpdateStatus(adoption.id, AdoptionStatus.Approved)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
              >
                Aprovar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getStatusColor(status) {
  switch (status) {
    case AdoptionStatus.Approved:
      return 'bg-green-100 text-green-800'
    case AdoptionStatus.Rejected:
      return 'bg-red-100 text-red-800'
    case AdoptionStatus.Cancelled:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case AdoptionStatus.Approved:
      return 'Aprovado'
    case AdoptionStatus.Rejected:
      return 'Recusado' 
    case AdoptionStatus.Cancelled:
      return 'Cancelado'
    default:
      return 'Pendente'
  }
}