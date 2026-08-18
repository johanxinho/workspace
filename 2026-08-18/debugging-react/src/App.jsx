import { useState, useEffect } from 'react'
import './App.css'

const tareasIniciales = [
  { id: 1, texto: 'Aprender React', categoria: 'estudio', completada: false },
  { id: 2, texto: 'Hacer ejercicio', categoria: 'salud', completada: true },
  { id: 3, texto: 'Leer un libro', categoria: 'ocio', completada: false },
  { id: 4, texto: 'Practicar debugging', completada: false },
]

function App() {
  const [tareas, setTareas] = useState(tareasIniciales)
  const [filtro, setFiltro] = useState('todas')
  const [contador, setContador] = useState(0)

  // BUG 2: falta el arreglo de dependencias y este efecto provoca renders infinitos.
  useEffect(() => {
    console.log('Renderizando App, contador:', contador)
    setContador(contador + 1)
  })

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtro === 'todas') return true
    // BUG 3: completada es booleano, no el string "true" o "false".
    if (filtro === 'completadas') return tarea.completada === 'true'
    if (filtro === 'pendientes') return tarea.completada === 'false'
    return true
  })

  function agregarTarea(texto) {
    if (!texto.trim()) return
    // BUG 4: push muta el arreglo original y conserva la misma referencia.
    tareas.push({ id: Date.now(), texto, categoria: 'general', completada: false })
    setTareas(tareas)
  }

  function completarTarea(id) {
    const nuevasTareas = tareas.map((tarea) =>
      tarea.id === id ? { ...tarea, completada: true } : tarea,
    )
    setTareas(nuevasTareas)
  }

  return (
    <div className="app">
      <p className="eyebrow">Taller de debugging / React</p>
      <h1>Mis tareas</h1>
      <p className="intro">Observa la consola, formula una hipótesis y corrige un bug a la vez.</p>

      <div className="filtros">
        <button onClick={() => setFiltro('todas')}>Todas</button>
        <button onClick={() => setFiltro('pendientes')}>Pendientes</button>
        <button onClick={() => setFiltro('completadas')}>Completadas</button>
      </div>

      <ul className="lista-tareas">
        {tareasFiltradas.map((tarea) => (
          <li key={tarea.id} className={tarea.completada ? 'completada' : ''}>
            <span>{tarea.texto}</span>
            {/* BUG 1: la tarea 4 no tiene categoria y undefined no tiene toUpperCase. */}
            <span className="categoria">{tarea.categoria.toUpperCase()}</span>
            <button onClick={() => completarTarea(tarea.id)} aria-label={`Completar ${tarea.texto}`}>✔</button>
          </li>
        ))}
      </ul>

      <AgregarTarea onAgregar={agregarTarea} />
      <PerfilUsuario />
    </div>
  )
}

function AgregarTarea({ onAgregar }) {
  const [texto, setTexto] = useState('')

  function manejarEnvio(event) {
    event.preventDefault()
    onAgregar(texto)
    setTexto('')
  }

  return (
    <form onSubmit={manejarEnvio} className="form-agregar">
      <input value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Nueva tarea" />
      <button type="submit">Agregar</button>
    </form>
  )
}

function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    obtenerUsuario()
  }, [])

  function obtenerUsuario() {
    const exito = Math.random() > 0.5
    setTimeout(() => {
      if (exito) {
        setUsuario({ nombre: 'Estudiante React' })
      } else {
        // BUG 5: el error asíncrono no se captura ni se refleja en la interfaz.
        throw new Error('No se pudo cargar el usuario')
      }
    }, 1000)
  }

  if (!usuario) return <p className="perfil">Cargando perfil...</p>
  return <p className="perfil">Perfil: {usuario.nombre}</p>
}

export default App