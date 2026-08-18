import { useState } from 'react'
import { supabase } from './supabaseClient'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)
    const response = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (response.error) {
      setIsError(true)
      setMessage(response.error.message)
      return
    }
    if (response.data.session) {
      onLogin(response.data.session)
      return
    }
    setIsError(false)
    setMessage('Revisa tu correo para confirmar la cuenta.')
  }

  return (
    <main className="auth-layout">
      <section className="intro-panel">
        <p className="eyebrow">Aula digital / 08.18</p>
        <div className="brand-mark" aria-hidden="true">S</div>
        <h1>Tu espacio de aprendizaje, siempre contigo.</h1>
        <p className="intro-copy">Accede a tus ejercicios y continúa exactamente donde lo dejaste.</p>
        <div className="signal" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      </section>
      <section className="form-panel" aria-labelledby="auth-title">
        <div className="form-wrap">
          <p className="form-kicker">Cuenta de estudiante</p>
          <h2 id="auth-title">{isSignUp ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h2>
          <p className="form-description">{isSignUp ? 'Regístrate para guardar tu progreso.' : 'Inicia sesión para continuar tu recorrido.'}</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" autoComplete="email" required />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required />
            {message && <p className={isError ? 'form-message error' : 'form-message'} role="alert">{message}</p>}
            <button className="submit-button" type="submit" disabled={loading}>{loading ? 'Procesando...' : isSignUp ? 'Registrarme' : 'Entrar'} <span aria-hidden="true">↗</span></button>
          </form>
          <button className="mode-button" type="button" onClick={() => { setIsSignUp((currentMode) => !currentMode); setMessage('') }}>{isSignUp ? 'Ya tengo una cuenta' : '¿No tienes cuenta? Regístrate'}</button>
        </div>
        <p className="privacy-note">Protegido con autenticación segura de Supabase.</p>
      </section>
    </main>
  )
}

export default Login