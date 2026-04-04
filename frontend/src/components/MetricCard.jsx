export default function MetricCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <p style={styles.label}>{label}</p>
      <p style={{ ...styles.value, color }}>{value}</p>
    </div>
  )
}

const styles = {
  card: { background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', minWidth: '130px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  label: { margin: '0 0 0.25rem', color: '#6b7280', fontSize: '0.875rem' },
  value: { margin: 0, fontSize: '1.75rem', fontWeight: 700 },
}
