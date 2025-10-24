import { useAuth } from '../context/AuthContext'
import { signOut } from '../utils/supabaseClient'
import Link from 'next/link'
import { useState } from 'react'

export default function Layout({ children }) {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Kaniu" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary">Kaniu</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/animals" className="text-gray-600 hover:text-primary">
                Adotar
              </Link>
              {user ? (
                <>
                  <Link href="/adoptions" className="text-gray-600 hover:text-primary">
                    Minhas Adoções
                  </Link>
                  {profile?.shelter_id ? (
                    <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                      Painel do Abrigo
                    </Link>
                  ) : (
                    <Link href="/register-shelter" className="text-gray-600 hover:text-primary">
                      Cadastrar Abrigo
                    </Link>
                  )}
                  <div className="relative group">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary">
                      <span>{profile?.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Meu Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Entrar
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4">
            <div className="container mx-auto px-4 space-y-4">
              <Link
                href="/animals"
                className="block text-gray-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Adotar
              </Link>
              {user ? (
                <>
                  <Link
                    href="/adoptions"
                    className="block text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Minhas Adoções
                  </Link>
                  {profile?.shelter_id ? (
                    <Link
                      href="/dashboard"
                      className="block text-gray-600 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Painel do Abrigo
                    </Link>
                  ) : (
                    <Link
                      href="/register-shelter"
                      className="block text-gray-600 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cadastrar Abrigo
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="block text-gray-600 hover:text-primary"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre o Kaniu</h3>
              <p className="text-gray-300">
                Plataforma dedicada a conectar abrigos e pessoas interessadas em adotar pets,
                facilitando o processo de adoção responsável.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links Úteis</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">
                  <a href="mailto:contato@kaniu.org" className="hover:text-white">
                    contato@kaniu.org
                  </a>
                </li>
                <li className="text-gray-300">
                  <a href="tel:+55XXXXXXXXXX" className="hover:text-white">
                    (XX) XXXX-XXXX
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Kaniu. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}