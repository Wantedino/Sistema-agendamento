export default function CalendarMini({ appointments }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  // Dias com agendamentos
  const daysWithAppts = new Set(
    appointments.map(a => new Date(a.date).getDate())
  )

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <p style={styles.monthLabel}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</p>
      <div style={styles.weekRow}>
        {weekDays.map((d, i) => <span key={i} style={styles.weekDay}>{d}</span>)}
      </div>
      <div style={styles.grid}>
        {cells.map((day, i) => (
          <div key={i} style={{
            ...styles.cell,
            background: day === now.getDate() ? '#4f46e5' : 'transparent',
            color: day === now.getDate() ? '#fff' : '#374151',
            fontWeight: day === now.getDate() ? 700 : 400,
          }}>
            {day || ''}
            {day && daysWithAppts.has(day) && day !== now.getDate() && (
              <span style={styles.dot} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  monthLabel: { textAlign: 'center', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.25rem' },
  weekDay: { textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
  cell: { textAlign: 'center', padding: '0.3rem', borderRadius: '50%', fontSize: '0.8rem', position: 'relative', cursor: 'default' },
  dot: { position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#4f46e5' },
}
