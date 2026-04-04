import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import SlotPicker from '../components/SlotPicker'

const STEPS = ['Serviço', 'Horário', 'Dados', 'Confirmação']

export default function BookingPage() {
  const { userId } = useParams()
  const [step, setStep] = useState(0)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ clientName: '', clientPhone: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/public/${userId}/services`).then(r => setServices(r.data)).catch(console.error)
  }, [userId])

  useEffect(() => {
    if (selectedService && selectedDate) {
      api.get(`/public/${userId}/slots?serviceId=${selectedService._id}&date=${selectedDate}`)
        .then(r => setSlots(r.data))
        .catch(console.error)
    }
  }, [selectedService, selectedDate, userId])

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await api.post('/appointments', {
        userId,
        serviceId: selectedService._id,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        date: selectedDate,
        time: selectedSlot,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao agendar')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '3rem', textAlign: 'center' }}>✅</div>
          <h2 style={{ textAlign: 'center', color: '#10b981' }}>Agendamento confirmado!</h2>
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            {form.clientName}, seu agendamento de <strong>{selectedService?.name}</strong> foi realizado para{' '}
            <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> às <strong>{selectedSlot}</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Agendar horário</h1>

        {/* Stepper */}
        <div style={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ ...styles.stepItem, color: i === step ? '#4f46e5' : i < step ? '#10b981' : '#9ca3af' }}>
              <div style={{ ...styles.stepDot, background: i === step ? '#4f46e5' : i < step ? '#10b981' : '#e5e7eb' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.75rem' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Serviço */}
        {step === 0 && (
          <div>
            <h3>Escolha o serviço</h3>
            {services.map(s => (
              <div key={s._id} style={{ ...styles.option, border: selectedService?._id === s._id ? '2px solid #4f46e5' : '2px solid #e5e7eb' }}
                onClick={() => setSelectedService(s)}>
                <strong>{s.name}</strong>
                <span style={{ color: '#6b7280' }}>{s.duration} min — R$ {s.price.toFixed(2)}</span>
              </div>
            ))}
            <button style={styles.button} disabled={!selectedService} onClick={() => setStep(1)}>Próximo</button>
          </div>
        )}

        {/* Step 1: Horário */}
        {step === 1 && (
          <div>
            <h3>Escolha a data e horário</h3>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }} style={styles.input} />
            {selectedDate && (
              <SlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            )}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button style={styles.backBtn} onClick={() => setStep(0)}>Voltar</button>
              <button style={styles.button} disabled={!selectedSlot} onClick={() => setStep(2)}>Próximo</button>
            </div>
          </div>
        )}

        {/* Step 2: Dados */}
        {step === 2 && (
          <div>
            <h3>Seus dados</h3>
            <input placeholder="Seu nome" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} style={styles.input} />
            <input placeholder="Telefone (WhatsApp)" value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} style={{ ...styles.input, marginTop: '0.75rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button style={styles.backBtn} onClick={() => setStep(1)}>Voltar</button>
              <button style={styles.button} disabled={!form.clientName || !form.clientPhone} onClick={() => setStep(3)}>Revisar</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmação */}
        {step === 3 && (
          <div>
            <h3>Confirmar agendamento</h3>
            <div style={styles.summary}>
              <p><strong>Serviço:</strong> {selectedService?.name}</p>
              <p><strong>Data:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {selectedSlot}</p>
              <p><strong>Nome:</strong> {form.clientName}</p>
              <p><strong>Telefone:</strong> {form.clientPhone}</p>
              <p><strong>Valor:</strong> R$ {selectedService?.price.toFixed(2)}</p>
            </div>
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button style={styles.backBtn} onClick={() => setStep(2)}>Voltar</button>
              <button style={styles.button} disabled={loading} onClick={handleConfirm}>
                {loading ? 'Agendando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', color: '#4f46e5', marginBottom: '1.5rem' },
  stepper: { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 },
  stepDot: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 },
  option: { padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' },
  button: { flex: 1, padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  backBtn: { padding: '0.75rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  summary: { background: '#f8fafc', borderRadius: '8px', padding: '1rem', lineHeight: '1.8' },
}
