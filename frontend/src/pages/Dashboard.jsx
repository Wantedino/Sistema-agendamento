import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import MetricCard from '../components/MetricCard'
import AppointmentRow from '../components/AppointmentRow'
import CalendarMini from '../components/CalendarMini'

const FILTERS = [
  { key: 'today', label: 'Hoje' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'history', label: 'Histórico' },
  { key: 'all', label: 'Todos' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [allAppointments, setAllAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('today')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/appointments')
      .then(r => setAllAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filtra no frontend
  const filtered = allAppointments.filter(a => {
    if (filter === 'today') return a.date === today
    if (filter === 'upcoming') return a.date > today
    if (filter === 'history') return a.date < today
    return true // 'all'
  })

  // Métricas sempre baseadas no filtro ativo
  const metrics = {
    total: filtered.length,
    confirmed: filtered.filter(a => a.status === 'confirmed').length,
    pending: filtered.filter(a => a.status === 'pending').length,
    cancelled: filtered.filter(a => a.status === 'cancelled').length,
    revenue: filtered
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.serviceId?.price || 0), 0),
  }

  async function updateStatus(id, status) {
    await api.put(`/appointments/${id}/status`, { status })
    setAllAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
  }

  const filterLabel = {
    today: 'de hoje',
    upcoming: 'próximos',
    history: 'histórico',
    all: 'totais',
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Agenda Pro</h1>
        <nav style={styles.nav}>
          <span style={styles.navLink} onClick={() => navigate('/services')}>Serviços</span>
          <span style={styles.navLink} onClick={() => navigate('/reports')}>Relatórios</span>
          <span style={styles.navLink} onClick={() => { logout(); navigate('/login') }}>Sair</span>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.greeting}>Olá, {user?.name} 👋</h2>
        <p style={styles.date}>
          Hoje: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {/* Filtros */}
        <div style={styles.filterBar}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                ...styles.filterBtn,
                background: filter === f.key ? '#4f46e5' : '#fff',
                color: filter === f.key ? '#fff' : '#374151',
                borderColor: filter === f.key ? '#4f46e5' : '#e5e7eb',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Métricas */}
        <div style={styles.metrics}>
          <MetricCard label={`Total ${filterLabel[filter]}`} value={metrics.total} color="#4f46e5" />
          <MetricCard label="Confirmados" value={metrics.confirmed} color="#10b981" />
          <MetricCard label="Pendentes" value={metrics.pending} color="#f59e0b" />
          <MetricCard label="Cancelados" value={metrics.cancelled} color="#ef4444" />
          <MetricCard label="Receita est." value={`R$ ${metrics.revenue.toFixed(2)}`} color="#6366f1" />
        </div>

        <div style={styles.grid}>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Agendamentos — {FILTERS.find(f => f.key === filter)?.label}
              <span style={styles.count}>{filtered.length}</span>
            </h3>

            {loading ? (
              <p style={styles.empty}>Carregando...</p>
            ) : filtered.length === 0 ? (
              <p style={styles.empty}>Nenhum agendamento {filterLabel[filter]}.</p>
            ) : (
              filtered
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map(a => (
                  <AppointmentRow key={a._id} appointment={a} onStatusChange={updateStatus} />
                ))
            )}
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Calendário</h3>
            <CalendarMini appointments={allAppointments} />
            <div style={styles.bookingLink}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Link de agendamento:</p>
              <code
                style={styles.code}
                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/book/${user?._id}`)}
                title="Clique para copiar"
              >
                /book/{user?._id}
              </code>
            </div>
          </section>
        </div>
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
  main: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  greeting: { margin: '0 0 0.25rem' },
  date: { color: '#6b7280', marginBottom: '1rem' },
  filterBar: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  filterBtn: {
    padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid',
    cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.15s',
  },
  metrics: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { marginTop: 0, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  count: { background: '#e0e7ff', color: '#4f46e5', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 },
  empty: { color: '#9ca3af', textAlign: 'center', padding: '2rem 0' },
  bookingLink: { marginTop: '1rem', padding: '0.75rem', background: '#f0f4f8', borderRadius: '8px' },
  code: { display: 'block', marginTop: '0.25rem', color: '#4f46e5', fontSize: '0.875rem', cursor: 'pointer' },
}
