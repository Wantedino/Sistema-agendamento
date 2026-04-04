const STATUS_COLORS = {
  confirmed: { bg: '#d1fae5', color: '#065f46', label: 'Confirmado' },
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pendente' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' },
}

export default function AppointmentRow({ appointment: a, onStatusChange }) {
  const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending

  return (
    <div style={styles.row}>
      <div style={styles.time}>{a.time}</div>
      <div style={styles.info}>
        <strong>{a.clientName}</strong>
        <span style={styles.service}>{a.serviceId?.name || 'Serviço'}</span>
      </div>
      <div style={styles.right}>
        <span style={{ ...styles.badge, background: s.bg, color: s.color }}>{s.label}</span>
        <select value={a.status} onChange={e => onStatusChange(a._id, e.target.value)} style={styles.select}>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmar</option>
          <option value="cancelled">Cancelar</option>
        </select>
      </div>
    </div>
  )
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' },
  time: { fontWeight: 700, color: '#4f46e5', minWidth: '50px' },
  info: { flex: 1, display: 'flex', flexDirection: 'column' },
  service: { fontSize: '0.8rem', color: '#6b7280' },
  right: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  select: { padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', cursor: 'pointer' },
}
