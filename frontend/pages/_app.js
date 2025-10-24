import { useRouter } from 'next/router'
import { AuthProvider } from '../context/AuthContext'
import Layout from '../components/Layout'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  // Páginas que não devem usar o layout padrão
  const noLayoutPages = ['/auth']

  return (
    <AuthProvider>
      {noLayoutPages.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  )
}

export default MyApp