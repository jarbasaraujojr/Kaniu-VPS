import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'

export default function ShelterForm({ shelter, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    description: '',
    photos: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (shelter) {
      setFormData(shelter)
    }
  }, [shelter])

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
          .from('shelter-photos')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100)
            }
          })

        if (uploadError) throw uploadError

        return supabase.storage
          .from('shelter-photos')
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
      const user = supabase.auth.user()
      if (!user) throw new Error('Usuário não autenticado')

      const data = {
        ...formData,
        owner_id: user.id
      }

      if (shelter) {
        const { error } = await supabase
          .from('shelters')
          .update(data)
          .eq('id', shelter.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('shelters')
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Abrigo</label>
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
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cidade</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <input
            type="text"
            name="state"
            value={formData.state}
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

      <div className="flex justify-end">
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