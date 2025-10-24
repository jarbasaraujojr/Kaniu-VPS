import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'
import AnimalForm from './AnimalForm'

export default function AnimalsList() {
  const [animals, setAnimals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)

  useEffect(() => {
    fetchAnimals()
  }, [])

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnimals(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnimalSaved = () => {
    setShowAddModal(false)
    setEditingAnimal(null)
    fetchAnimals()
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return

    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAnimals(animals.filter(animal => animal.id !== id))
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Animal excluído com sucesso!'
        }
      }))
    } catch (error) {
      setError(error.message)
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Animais</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
        >
          Adicionar Animal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map(animal => (
          <div 
            key={animal.id}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
          >
            {animal.photos?.[0] && (
              <div className="h-48 overflow-hidden">
                <img
                  src={animal.photos[0]}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{animal.name}</h3>
                  <p className="text-gray-600">
                    {animal.breed || animal.species}
                    {animal.age && ` • ${animal.age} ${animal.age_unit}`}
                  </p>
                </div>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm
                  ${getStatusColor(animal.status)}
                `}>
                  {getStatusLabel(animal.status)}
                </span>
              </div>

              <p className="mt-2 text-gray-700 line-clamp-2">
                {animal.description}
              </p>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => handleDelete(animal.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setEditingAnimal(animal)}
                  className="text-primary hover:text-primary-dark"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingAnimal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AnimalForm
              animal={editingAnimal}
              onSave={handleAnimalSaved}
              onCancel={() => {
                setShowAddModal(false)
                setEditingAnimal(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'adopted':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'available':
      return 'Disponível'
    case 'adopted':
      return 'Adotado'
    case 'pending':
      return 'Pendente'
    case 'fostered':
      return 'Em Lar Temporário'
    default:
      return 'Indisponível'
  }
}