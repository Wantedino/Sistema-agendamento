import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import MetricCard from '../components/MetricCard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

function TooltipCustom({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
      <p style={{ margin: 0, color: '#6b7280' }}>Dia {payload[0].payload.day}</p>
      <p style={{ margin: 0, fontWeight: 700, color: '#4f46e5' }}>R$ {Number(payload[0].value).toFixed(2)}</p>
    </div>
  )
}

export default function Reports() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/reports?month=${month}&year=${year}`)
      .then(r => setData(r.data))
      .catch(() => setError('Erro ao carregar relatório.'))
      .finally(() => setLoading(false))
  }, [month, year])

  // Calcula receita por serviço a partir do topServices + appointments
  // O backend já retorna topServices com name e count
  // Para receita por serviço precisamos calcular no frontend com os dados disponíveis

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Agenda Pro</h1>
        <nav style={styles.nav}>
          <span style={styles.navLink} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate('/services')}>Serviços</span>
          <span style={styles.navLink} onClick={() => { logout(); navigate('/login') }}>Sair</span>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>Relatórios</h2>

          {/* Seletor mês/ano */}
          <div style={styles.selectors}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={styles.select}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={styles.select}>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p style={styles.hint}>Carregando...</p>
        ) : data && (
          <>
            {/* Metric cards */}
            <div style={styles.metrics}>
              <MetricCard
                label="Receita do mês"
                value={`R$ ${data.revenue.toFixed(2)}`}
                color="#10b981"
              />
              <MetricCard
                label="Total agendamentos"
                value={data.total}
                color="#4f46e5"
              />
              <MetricCard
                label="Confirmados"
                value={data.byStatus.confirmed}
                color="#6366f1"
              />
              <MetricCard
                label="Ticket médio"
                value={`R$ ${data.avgTicket.toFixed(2)}`}
                color="#f59e0b"
              />
            </div>

            {/* Gráfico de barras */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                Receita por dia — {MONTHS[month - 1]} {year}
              </h3>
              {data.revenueByDay.length === 0 ? (
                <p style={styles.hint}>Nenhuma receita confirmada neste período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.revenueByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={d => `${d}`}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={v => `R$${v}`}
                      width={70}
                    />
                    <Tooltip content={<TooltipCustom />} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Ranking de serviços */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Serviços mais agendados</h3>
              {data.topServices.length === 0 ? (
                <p style={styles.hint}>Nenhum agendamento neste período.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Serviço</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Agendamentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topServices.map((s, i) => (
                      <tr key={s.name} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.rank,
                            background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : '#fef9f0',
                            color: i === 0 ? '#92400e' : '#374151',
                          }}>
                            {i + 1}
                          </span>
                        </td>
                        <td style={styles.td}>{s.name}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={styles.countBadge}>{s.count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Breakdown por status */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Distribuição por status</h3>
              <div style={styles.statusRow}>
                {[
                  { label: 'Confirmados', key: 'confirmed', color: '#10b981', bg: '#d1fae5' },
                  { label: 'Pendentes', key: 'pending', color: '#f59e0b', bg: '#fef3c7' },
                  { label: 'Cancelados', key: 'cancelled', color: '#ef4444', bg: '#fee2e2' },
                ].map(s => (
                  <div key={s.key} style={{ ...styles.statusCard, background: s.bg }}>
                    <span style={{ ...styles.statusValue, color: s.color }}>
                      {data.byStatus[s.key]}
                    </span>
                    <span style={styles.statusLabel}>{s.label}</span>
                    {data.total > 0 && (
                      <span style={{ ...styles.statusPct, color: s.color }}>
                        {Math.round((data.byStatus[s.key] / data.total) * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
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
  main: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.5rem', color: '#1f2937' },
  selectors: { display: 'flex', gap: '0.75rem' },
  select: { padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', cursor: 'pointer', background: '#fff' },
  metrics: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem' },
  cardTitle: { margin: '0 0 1.25rem', color: '#1f2937', fontSize: '1rem' },
  hint: { color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' },
  error: { color: '#dc2626', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', borderBottom: '2px solid #f3f4f6' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#1f2937', borderBottom: '1px solid #f3f4f6' },
  rank: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', fontWeight: 700, fontSize: '0.85rem' },
  countBadge: { background: '#e0e7ff', color: '#4f46e5', borderRadius: '999px', padding: '0.2rem 0.75rem', fontWeight: 700, fontSize: '0.85rem' },
  statusRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  statusCard: { flex: 1, minWidth: '140px', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  statusValue: { fontSize: '2rem', fontWeight: 700 },
  statusLabel: { fontSize: '0.85rem', color: '#374151', fontWeight: 500 },
  statusPct: { fontSize: '0.8rem', fontWeight: 600 },
}
