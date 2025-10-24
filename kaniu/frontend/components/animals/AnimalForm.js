import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'

export default function AnimalForm({ animal, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    age_unit: 'years',
    gender: '',
    size: '',
    weight: '',
    color: '',
    description: '',
    status: 'available',
    photos: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (animal) {
      setFormData({
        ...animal,
        age: animal.age?.toString() || '',
        weight: animal.weight?.toString() || ''
      })
    }
  }, [animal])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('animal-photos')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100)
            }
          })

        if (uploadError) throw uploadError

        return supabase.storage
          .from('animal-photos')
          .getPublicUrl(filePath).data.publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploadedUrls]
      }))
    } catch (error) {
      setError('Erro ao fazer upload das fotos: ' + error.message)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null
      }

      if (animal) {
        const { error } = await supabase
          .from('animals')
          .update(data)
          .eq('id', animal.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('animals')
          .insert([data])

        if (error) throw error
      }

      onSave()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-bold mb-6">
        {animal ? 'Editar Animal' : 'Adicionar Animal'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Espécie</label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Selecione...</option>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Raça</label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Idade</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidade</label>
            <select
              name="age_unit"
              value={formData.age_unit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="years">Anos</option>
              <option value="months">Meses</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gênero</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Selecione...</option>
            <option value="male">Macho</option>
            <option value="female">Fêmea</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Porte</label>
          <select
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Selecione...</option>
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cor</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="available">Disponível</option>
          <option value="pending">Pendente</option>
          <option value="adopted">Adotado</option>
          <option value="fostered">Em Lar Temporário</option>
          <option value="unavailable">Indisponível</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fotos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="mt-1 block w-full"
        />
        {uploadProgress > 0 && (
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-primary rounded"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        {formData.photos?.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            {formData.photos.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}