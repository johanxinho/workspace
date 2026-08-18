import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import Productos from './Productos'
import { isSupabaseConfigured, supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => setSession(currentSession))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (!isSupabaseConfigured) return <main className="setup-state"><p className="eyebrow">Configuración pendiente</p><h1>Conecta tu proyecto de Supabase</h1><p>Crea un archivo `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.</p></main>
  if (!session) return <Login onLogin={setSession} />
  return (
    <main className="dashboard-state">
      <header className="dashboard-header">
        <div><p className="eyebrow">Sesión activa</p><p className="user-email">{session.user.email}</p></div>
        <button className="logout-button" type="button" onClick={handleLogout}>Cerrar sesión <span aria-hidden="true">↗</span></button>
      </header>
      <Productos session={session} />
    </main>
  )
}

export default App
