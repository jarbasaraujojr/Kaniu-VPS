import { useState } from 'react'
import { signIn, signUp, resetPassword } from '../../utils/supabaseClient'

export default function AuthForm() {
  const [mode, setMode] = useState('login') // login, register, reset
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem')
        }
        
        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
        
        if (error) throw error

        // Mostra mensagem de sucesso e muda para login
        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: 'Conta criada com sucesso! Verifique seu email para confirmar o cadastro.'
          }
        }))
        setMode('login')

      } else if (mode === 'login') {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password
        })
        
        if (error) throw error

      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        
        if (error) throw error

        window.dispatchEvent(new CustomEvent('notification', {
          detail: {
            type: 'success',
            message: 'Enviamos instruções para redefinir sua senha por email.'
          }
        }))
        setMode('login')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {mode === 'login' && 'Entrar'}
          {mode === 'register' && 'Criar Conta'}
          {mode === 'reset' && 'Recuperar Senha'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'login' && 'Entre para gerenciar seu abrigo ou adotar um pet'}
          {mode === 'register' && 'Crie sua conta para começar'}
          {mode === 'reset' && 'Digite seu email para recuperar sua senha'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={mode === 'register'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}

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

        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={mode !== 'reset'}
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={mode === 'register'}
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processando...' : (
            mode === 'login' ? 'Entrar' :
            mode === 'register' ? 'Criar Conta' :
            'Enviar Email'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        {mode === 'login' && (
          <>
            <button
              onClick={() => setMode('register')}
              className="text-primary hover:text-primary-dark"
            >
              Criar uma conta
            </button>
            <span className="mx-2">•</span>
            <button
              onClick={() => setMode('reset')}
              className="text-primary hover:text-primary-dark"
            >
              Esqueci minha senha
            </button>
          </>
        )}
        {(mode === 'register' || mode === 'reset') && (
          <button
            onClick={() => setMode('login')}
            className="text-primary hover:text-primary-dark"
          >
            Voltar para login
          </button>
        )}
      </div>
    </div>
  )
}