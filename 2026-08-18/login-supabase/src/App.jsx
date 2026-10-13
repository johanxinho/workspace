import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import Productos from './Productos'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { getCookie, setCookie } from './utils/cookies'

function App() {
  const [session, setSession] = useState(null)
  const [darkTheme, setDarkTheme] = useState(() => getCookie('tema') === 'oscuro')

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => setSession(currentSession))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light'
    setCookie('tema', darkTheme ? 'oscuro' : 'claro', 365, {
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax',
    })
  }, [darkTheme])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  let content
  if (!isSupabaseConfigured) {
    content = <main className="setup-state"><p className="eyebrow">Configuración pendiente</p><h1>Conecta tu proyecto de Supabase</h1><p>Crea un archivo `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.</p></main>
  } else if (!session) {
    content = <Login onLogin={setSession} />
  } else {
    content = (
      <main className="dashboard-state">
        <header className="dashboard-header">
          <div><p className="eyebrow">Sesión activa</p><p className="user-email">{session.user.email}</p></div>
          <button className="logout-button" type="button" onClick={handleLogout}>Cerrar sesión <span aria-hidden="true">↗</span></button>
        </header>
        <Productos session={session} />
      </main>
    )
  }

  return (
    <>
      <button
        className="theme-toggle"
        type="button"
        aria-pressed={darkTheme}
        onClick={() => setDarkTheme((currentTheme) => !currentTheme)}
      >
        Tema: {darkTheme ? 'oscuro' : 'claro'}
      </button>
      {content}
    </>
  )
}

export default App
