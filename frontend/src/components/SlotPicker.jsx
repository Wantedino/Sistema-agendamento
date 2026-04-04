export default function SlotPicker({ slots, selected, onSelect }) {
  if (!slots.length) {
    return <p style={{ color: '#9ca3af', marginTop: '0.75rem' }}>Nenhum horário disponível para esta data.</p>
  }

  return (
    <div style={styles.grid}>
      {slots.map(slot => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          style={{
            ...styles.slot,
            background: selected === slot.time ? '#4f46e5' : slot.available ? '#f0f4f8' : '#f3f4f6',
            color: selected === slot.time ? '#fff' : slot.available ? '#1f2937' : '#9ca3af',
            cursor: slot.available ? 'pointer' : 'not-allowed',
            textDecoration: !slot.available ? 'line-through' : 'none',
          }}
        >
          {slot.time}
        </button>
      ))}
    </div>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.75rem' },
  slot: { padding: '0.5rem', borderRadius: '8px', border: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s' },
}
