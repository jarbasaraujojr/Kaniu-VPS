export default function IndexPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Encontre seu novo melhor amigo
              </h1>
              <p className="text-lg text-gray-100">
                Conectamos abrigos e pessoas interessadas em adoção responsável. 
                Comece sua jornada de amor hoje mesmo.
              </p>
              <div className="space-x-4">
                <a href="/animals" className="btn bg-white text-primary hover:bg-gray-100">
                  Adotar um Pet
                </a>
                <a href="/register-shelter" className="btn bg-transparent border-2 hover:bg-white/10">
                  Sou um Abrigo
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="/hero-image.jpg"
                alt="Cachorro feliz com sua família"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Encontre</h3>
              <p className="text-gray-600">
                Navegue pelos pets disponíveis e encontre aquele com quem você mais se identifica.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Converse</h3>
              <p className="text-gray-600">
                Entre em contato com o abrigo e tire todas as suas dúvidas sobre o processo de adoção.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Adote</h3>
              <p className="text-gray-600">
                Complete o processo de adoção e dê um lar amoroso para um pet que precisa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-gray-600">Pets Adotados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Abrigos Parceiros</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600">Usuários Cadastrados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para mudar uma vida?
          </h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Comece sua jornada de adoção hoje mesmo. Centenas de pets estão esperando por um lar amoroso.
          </p>
          <a
            href="/animals"
            className="btn bg-white text-primary hover:bg-gray-100"
          >
            Encontrar um Pet
          </a>
        </div>
      </section>
    </div>
  )
}