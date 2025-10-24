import { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'

export default function AdoptButton({ animalId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/adoptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({
          animal_id: animalId,
          message
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      setShowModal(false)
      // Trigger success notification
      window.dispatchEvent(new CustomEvent('notification', {
        detail: {
          type: 'success',
          message: 'Pedido de adoção enviado com sucesso!'
        }
      }))
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
      >
        Quero Adotar
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Pedido de Adoção</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mensagem para o abrigo
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  placeholder="Conte um pouco sobre você e por que quer adotar este animal..."
                ></textarea>
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}