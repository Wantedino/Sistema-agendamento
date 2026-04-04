import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const EMPTY_FORM = { name: '', duration: '', price: '' }

export default function Services() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/services')
      .then(r => setServices(r.data))
      .catch(() => setError('Erro ao carregar serviços.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Informe o nome do serviço.')
    if (!form.duration || Number(form.duration) <= 0) return setError('Duração deve ser maior que zero.')
    if (form.price === '' || Number(form.price) < 0) return setError('Preço inválido.')

    const payload = {
      name: form.name.trim(),
      duration: Number(form.duration),
      price: Number(form.price),
    }

    setSaving(true)
    try {
      if (editId) {
        const { data } = await api.put(`/services/${editId}`, payload)
        setServices(prev => prev.map(s => s._id === editId ? data : s))
      } else {
        const { data } = await api.post('/services', payload)
        setServices(prev => [...prev, data])
      }
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar serviço.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(service) {
    setEditId(service._id)
    setForm({ name: service.name, duration: service.duration, price: service.price })
    setShowForm(true)
    setError('')
  }

  async function handleDelete(id) {
    if (!confirm('Remover este serviço?')) return
    try {
      await api.delete(`/services/${id}`)
      setServices(prev => prev.filter(s => s._id !== id))
    } catch {
      setError('Erro ao remover serviço.')
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
    setError('')
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Agenda Pro</h1>
        <nav style={styles.nav}>
          <span style={styles.navLink} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink} onClick={() => { logout(); navigate('/login') }}>Sair</span>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>Serviços</h2>
          {!showForm && (
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              + Novo serviço
            </button>
          )}
        </div>

        {/* Formulário inline */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>{editId ? 'Editar serviço' : 'Novo serviço'}</h3>
            <form onSubmit={handleSubmit} style={styles.form} noValidate>
              <label style={styles.label}>
                Nome do serviço
                <input
                  name="name"
                  type="text"
                  placeholder="Ex: Corte de cabelo"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                  autoFocus
                />
              </label>
              <div style={styles.row}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Duração (min)
                  <input
                    name="duration"
                    type="number"
                    placeholder="30"
                    value={form.duration}
                    onChange={handleChange}
                    style={styles.input}
                    min="1"
                  />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Preço (R$)
                  <input
                    name="price"
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                    step="0.01"
                  />
                </label>
              </div>

              {error && <p style={styles.error} role="alert">{error}</p>}

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Adicionar serviço'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <p style={styles.loadingText}>Carregando serviços...</p>
        ) : services.length === 0 ? (
          <div style={styles.empty}>
            <p>Nenhum serviço cadastrado ainda.</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Clique em "Novo serviço" para começar.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {services.map(s => (
              <div key={s._id} style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardName}>{s.name}</h3>
                  <div style={styles.cardMeta}>
                    <span style={styles.badge}>⏱ {s.duration} min</span>
                    <span style={{ ...styles.badge, background: '#d1fae5', color: '#065f46' }}>
                      R$ {Number(s.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(s)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(s._id)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  header: { background: '#4f46e5', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { margin: 0, fontSize: '1.5rem' },
  nav: { display: 'flex', gap: '1.5rem' },
  navLink: { cursor: 'pointer', fontWeight: 500, opacity: 0.9 },
  main: { padding: '2rem', maxWidth: '860px', margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { margin: 0, fontSize: '1.5rem', color: '#1f2937' },
  addBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem', border: '2px solid #e0e7ff' },
  formTitle: { margin: '0 0 1rem', color: '#1f2937' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: { padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', width: '100%' },
  row: { display: 'flex', gap: '1rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0, background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' },
  cancelBtn: { padding: '0.6rem 1.25rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  saveBtn: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  loadingText: { color: '#6b7280', textAlign: 'center', padding: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardName: { margin: 0, fontSize: '1rem', color: '#1f2937' },
  cardMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500, background: '#e0e7ff', color: '#3730a3' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  editBtn: { flex: 1, padding: '0.4rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  deleteBtn: { flex: 1, padding: '0.4rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
}
