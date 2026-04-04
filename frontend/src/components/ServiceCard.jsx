export default function ServiceCard({ service: s, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <div style={styles.info}>
        <strong>{s.name}</strong>
        <span style={styles.meta}>{s.duration} min — R$ {s.price.toFixed(2)}</span>
      </div>
      <div style={styles.actions}>
        <button style={styles.editBtn} onClick={() => onEdit(s)}>Editar</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(s._id)}>Remover</button>
      </div>
    </div>
  )
}

const styles = {
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '0.5rem' },
  info: { display: 'flex', flexDirection: 'column' },
  meta: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  editBtn: { padding: '0.3rem 0.75rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  deleteBtn: { padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
}
