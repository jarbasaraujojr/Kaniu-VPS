import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'
import ShelterForm from './ShelterForm'
import AnimalsList from '../animals/AnimalsList'

export default function ShelterDashboard() {
  const [shelter, setShelter] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('animals')

  useEffect(() => {
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
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Carregando...</div>

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Faça login para acessar o painel do abrigo
          </h2>
          {/* Adicionar botão de login aqui */}
        </div>
      </div>
    )
  }

  if (!shelter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            Cadastrar Novo Abrigo
          </h2>
          <ShelterForm
            onSave={() => fetchShelter(user.id)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{shelter.name}</h1>
          <p className="text-gray-600 mt-2">{shelter.city}, {shelter.state}</p>
        </div>
        <button
          onClick={() => setActiveTab('profile')}
          className="text-primary hover:text-primary-dark"
        >
          Editar Perfil
        </button>
      </div>

      <div className="mb-8">
        <nav className="border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('animals')}
              className={`py-4 px-1 ${
                activeTab === 'animals'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Animais
            </button>
            <button
              onClick={() => setActiveTab('adoptions')}
              className={`py-4 px-1 ${
                activeTab === 'adoptions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pedidos de Adoção
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`py-4 px-1 ${
                activeTab === 'medical'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registros Médicos
            </button>
          </div>
        </nav>
      </div>

      {activeTab === 'animals' && <AnimalsList />}
      {activeTab === 'adoptions' && <AdoptionsList isShelter={true} />}
      {activeTab === 'medical' && <MedicalRecordsList />}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto">
          <ShelterForm
            shelter={shelter}
            onSave={() => {
              fetchShelter(user.id)
              setActiveTab('animals')
            }}
          />
        </div>
      )}
    </div>
  )
}