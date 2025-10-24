import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '../utils/supabaseClient'

const AuthContext = createContext({
  user: null,
  isLoading: true,
  profile: null
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const { user: currentUser } = await getCurrentUser()
        setUser(currentUser)
        setProfile(currentUser)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { user: currentUser } = await getCurrentUser()
      setUser(currentUser)
      setProfile(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    profile
  }

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}