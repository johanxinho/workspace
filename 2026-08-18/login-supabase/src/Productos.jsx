import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const emptyForm = { nombre: '', descripcion: '', precio: '' }

function Productos({ session }) {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const cargarProductos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setErrorMsg(error.message)
    else setProductos(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let active = true

    const cargarProductosIniciales = async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })

      if (!active) return
      if (error) setErrorMsg(error.message)
      else setProductos(data ?? [])
      setLoading(false)
    }

    cargarProductosIniciales()
    return () => { active = false }
  }, [])

  const limpiarFormulario = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    setSaving(true)

    const product = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
    }
    const response = editingId
      ? await supabase.from('productos').update(product).eq('id', editingId)
      : await supabase.from('productos').insert({ ...product, user_id: session.user.id })

    setSaving(false)
    if (response.error) {
      setErrorMsg(response.error.message)
      return
    }

    limpiarFormulario()
    await cargarProductos()
  }

  const handleEditar = (producto) => {
    setEditingId(producto.id)
    setForm({ nombre: producto.nombre, descripcion: producto.descripcion ?? '', precio: producto.precio })
    setErrorMsg('')
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return
    setErrorMsg('')
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) setErrorMsg(error.message)
    else await cargarProductos()
  }

  return (
    <section className="products-section" aria-labelledby="products-title">
      <div className="products-heading">
        <div>
          <p className="form-kicker">Catálogo privado</p>
          <h2 id="products-title">Mis productos</h2>
        </div>
        <span className="product-count">{productos.length} {productos.length === 1 ? 'producto' : 'productos'}</span>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Ej. Cuaderno" required />
        </div>
        <div className="field-group">
          <label htmlFor="descripcion">Descripción</label>
          <input id="descripcion" name="descripcion" type="text" value={form.descripcion} onChange={handleChange} placeholder="Un detalle breve" />
        </div>
        <div className="field-group price-field">
          <label htmlFor="precio">Precio</label>
          <input id="precio" name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} placeholder="0.00" required />
        </div>
        {errorMsg && <p className="products-error" role="alert">{errorMsg}</p>}
        <div className="product-actions">
          <button className="submit-button" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'} <span aria-hidden="true">↗</span></button>
          {editingId && <button className="cancel-button" type="button" onClick={limpiarFormulario}>Cancelar</button>}
        </div>
      </form>

      <div className="product-list" aria-live="polite">
        {loading ? <p className="empty-products">Cargando productos...</p> : productos.length === 0 ? <p className="empty-products">Aún no tienes productos registrados.</p> : productos.map((producto) => (
          <article className="product-row" key={producto.id}>
            <div className="product-info"><h3>{producto.nombre}</h3><p>{producto.descripcion || 'Sin descripción'}</p></div>
            <strong className="product-price">${Number(producto.precio).toFixed(2)}</strong>
            <div className="row-actions"><button type="button" onClick={() => handleEditar(producto)}>Editar</button><button className="delete-action" type="button" onClick={() => handleEliminar(producto.id)}>Eliminar</button></div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Productos