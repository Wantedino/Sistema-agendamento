import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import MetricCard from '../components/MetricCard'
import AppointmentRow from '../components/AppointmentRow'
import CalendarMini from '../components/CalendarMini'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [allAppointments, setAllAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([
      api.get(`/appointments?date=${today}`),
      api.get('/appointments'),
    ])
      .then(([todayRes, allRes]) => {
        setAppointments(todayRes.data)
        setAllAppointments(allRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [today])

  const metrics = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    revenue: appointments
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.serviceId?.price || 0), 0),
  }

  async function updateStatus(id, status) {
    await api.put(`/appointments/${id}/status`, { status })
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a))
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Agenda Pro</h1>
        <nav style={styles.nav}>
          <span style={styles.navLink} onClick={() => navigate('/services')}>Serviços</span>
          <span style={styles.navLink} onClick={() => { logout(); navigate('/login') }}>Sair</span>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.greeting}>Olá, {user?.name} 👋</h2>
        <p style={styles.date}>Hoje: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        <div style={styles.metrics}>
          <MetricCard label="Total hoje" value={metrics.total} color="#4f46e5" />
          <MetricCard label="Confirmados" value={metrics.confirmed} color="#10b981" />
          <MetricCard label="Pendentes" value={metrics.pending} color="#f59e0b" />
          <MetricCard label="Cancelados" value={metrics.cancelled} color="#ef4444" />
          <MetricCard label="Receita est." value={`R$ ${metrics.revenue.toFixed(2)}`} color="#6366f1" />
        </div>

        <div style={styles.grid}>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Agendamentos de hoje</h3>
            {loading ? <p>Carregando...</p> : appointments.length === 0 ? (
              <p style={styles.empty}>Nenhum agendamento para hoje.</p>
            ) : (
              appointments.map(a => (
                <AppointmentRow key={a._id} appointment={a} onStatusChange={updateStatus} />
              ))
            )}
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Calendário</h3>
            <CalendarMini appointments={allAppointments} />
            <div style={styles.bookingLink}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Link de agendamento:</p>
              <code style={styles.code}>/book/{user?._id}</code>
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
  date: { color: '#6b7280', marginBottom: '1.5rem' },
  metrics: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { marginTop: 0, color: '#1f2937', marginBottom: '1rem' },
  empty: { color: '#9ca3af', textAlign: 'center', padding: '2rem 0' },
  bookingLink: { marginTop: '1rem', padding: '0.75rem', background: '#f0f4f8', borderRadius: '8px' },
  code: { display: 'block', marginTop: '0.25rem', color: '#4f46e5', fontSize: '0.875rem' },
}
