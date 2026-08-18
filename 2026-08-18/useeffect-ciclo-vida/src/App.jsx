import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [mostrarReloj, setMostrarReloj] = useState(true)
  const [usuarioId, setUsuarioId] = useState(1)

  return <div className="app">
    <p className="eyebrow">Taller de React / useEffect</p><h1>Ciclo de vida</h1>
    <p className="intro">Observa cuándo se montan, actualizan y desmontan los componentes.</p>
    <section><h2>1. Reloj</h2><button onClick={() => setMostrarReloj(!mostrarReloj)}>{mostrarReloj ? 'Ocultar reloj' : 'Mostrar reloj'}</button>{mostrarReloj && <Reloj />}</section>
    <section><h2>2. Contador automático</h2><ContadorAutomatico /></section>
    <section><h2>3. Ancho de ventana</h2><RastreadorVentana /></section>
    <section><h2>4. Perfil de usuario</h2><div className="botones-usuario"><button onClick={() => setUsuarioId(1)}>Usuario 1</button><button onClick={() => setUsuarioId(2)}>Usuario 2</button></div><PerfilUsuario id={usuarioId} /></section>
    <section><h2>5. Experimento: fases del ciclo de vida</h2><ExperimentoFases /></section>
  </div>
}

function Reloj() {
  const [segundos, setSegundos] = useState(0)
  // BUG 1: falta limpiar el intervalo al desmontar.
  useEffect(() => {
    console.log('Reloj montado')
    const id = setInterval(() => setSegundos((s) => { console.log('tick, segundos:', s + 1); return s + 1 }), 1000)
    // Falta: return () => clearInterval(id)
  }, [])
  return <p>Segundos: {segundos}</p>
}

function ContadorAutomatico() {
  const [contador, setContador] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      // BUG 2: esta closure conserva contador = 0.
      console.log('El contador según el efecto es:', contador)
      setContador(contador + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <p>Contador: {contador}</p>
}

function RastreadorVentana() {
  const [ancho, setAncho] = useState(window.innerWidth)
  // BUG 3: falta cleanup y el efecto se reinicia al cambiar ancho.
  useEffect(() => {
    function manejarResize() { console.log('Resize detectado, ancho:', window.innerWidth); setAncho(window.innerWidth) }
    window.addEventListener('resize', manejarResize)
    // Falta: return () => window.removeEventListener('resize', manejarResize)
  }, [ancho])
  return <p>Ancho actual: {ancho}px</p>
}

function PerfilUsuario({ id }) {
  const [nombre, setNombre] = useState('')
  // BUG 4: id falta en las dependencias.
  useEffect(() => { console.log('Buscando datos del usuario', id); const nombres = { 1: 'Ana', 2: 'Luis' }; setNombre(nombres[id]) }, [])
  return <p>Nombre: {nombre}</p>
}

function ExperimentoFases() {
  const [clics, setClics] = useState(0)
  const esPrimeraVez = useRef(true)
  useEffect(() => {
    if (esPrimeraVez.current) { console.log('MONTADO'); esPrimeraVez.current = false } else console.log('ACTUALIZADO, clics:', clics)
    return () => console.log('LIMPIEZA (antes del próximo efecto, o al desmontar)')
  }, [clics])
  return <div><p>Clics: {clics}</p><button onClick={() => setClics(clics + 1)}>Clickeame</button></div>
}

export default App
