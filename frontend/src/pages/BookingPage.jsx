import { useState } from 'react'
import { useParams } from 'react-router-dom'

const MOCK_SERVICES = [
  { _id: '1', name: 'Corte de cabelo', duration: 30, price: 45 },
  { _id: '2', name: 'Barba', duration: 20, price: 30 },
  { _id: '3', name: 'Corte + Barba', duration: 50, price: 70 },
  { _id: '4', name: 'Hidratação', duration: 40, price: 55 },
]

const MOCK_SLOTS = [
  { time: '08:00', available: true },
  { time: '08:30', available: true },
  { time: '09:00', available: false },
  { time: '09:30', available: true },
  { time: '10:00', available: false },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: false },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: false },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: false },
  { time: '16:30', available: true },
]

const STEPS = ['Serviço', 'Horário', 'Seus dados', 'Confirmação']

export default function BookingPage() {
  const { userId } = useParams()
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [form, setForm] = useState({ clientName: '', clientPhone: '' })
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSelectService(service) {
    setSelectedService(service)
  }

  function handleSelectSlot(slot) {
    if (!slot.available) return
    setSelectedSlot(slot.time)
  }

  function handleFormChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function goNext() {
    setStep(s => s + 1)
  }

  function goBack() {
    setStep(s => s - 1)
  }

  function handleConfirm() {
    setFormError('')
    if (!form.clientName.trim()) return setFormError('Informe seu nome.')
    if (!form.clientPhone.trim()) return setFormError('Informe seu telefone.')
    setSuccess(true)
  }

  // ── Tela de sucesso ──────────────────────────────────────────────
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Agendamento confirmado!</h2>
            <p style={styles.successSub}>
              Até logo, <strong>{form.clientName}</strong>!
            </p>
            <div style={styles.summaryBox}>
              <SummaryRow label="Serviço" value={selectedService.name} />
              <SummaryRow label="Duração" value={`${selectedService.duration} min`} />
              <SummaryRow label="Valor" value={`R$ ${selectedService.price.toFixed(2)}`} />
              <SummaryRow
                label="Data"
                value={new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              />
              <SummaryRow label="Horário" value={selectedSlot} />
              <SummaryRow label="Telefone" value={form.clientPhone} />
            </div>
            <p style={styles.successNote}>
              Guarde essas informações. Em caso de dúvidas, entre em contato com o estabelecimento.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Layout principal ─────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.logo}>Agenda Pro</h1>

        {/* Barra de progresso */}
        <div style={styles.stepper}>
          {STEPS.map((label, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={label} style={styles.stepWrapper}>
                <div style={{
                  ...styles.stepDot,
                  background: done ? '#10b981' : active ? '#4f46e5' : '#e5e7eb',
                  color: done || active ? '#fff' : '#9ca3af',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{
                  ...styles.stepLabel,
                  color: active ? '#4f46e5' : done ? '#10b981' : '#9ca3af',
                  fontWeight: active ? 600 : 400,
                }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div style={{
                    ...styles.stepLine,
                    background: done ? '#10b981' : '#e5e7eb',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card de conteúdo */}
        <div style={styles.card}>

          {/* ── Step 0: Serviço ── */}
          {step === 0 && (
            <div>
              <h2 style={styles.stepTitle}>Escolha o serviço</h2>
              <div style={styles.serviceGrid}>
                {MOCK_SERVICES.map(s => (
                  <button
                    key={s._id}
                    onClick={() => handleSelectService(s)}
                    style={{
                      ...styles.serviceCard,
                      border: selectedService?._id === s._id
                        ? '2px solid #4f46e5'
                        : '2px solid #e5e7eb',
                      background: selectedService?._id === s._id ? '#eef2ff' : '#fff',
                    }}
                  >
                    <span style={styles.serviceName}>{s.name}</span>
                    <div style={styles.serviceMeta}>
                      <span style={styles.chip}>⏱ {s.duration} min</span>
                      <span style={{ ...styles.chip, background: '#d1fae5', color: '#065f46' }}>
                        R$ {s.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div style={styles.actions}>
                <button
                  style={{ ...styles.btnPrimary, opacity: selectedService ? 1 : 0.5 }}
                  disabled={!selectedService}
                  onClick={goNext}
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Horário ── */}
          {step === 1 && (
            <div>
              <h2 style={styles.stepTitle}>Escolha a data e horário</h2>
              <label style={styles.label}>
                Data
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
                  style={styles.input}
                />
              </label>

              {selectedDate && (
                <>
                  <p style={styles.slotHint}>
                    <span style={styles.legendDot('#4f46e5')} /> Disponível &nbsp;
                    <span style={styles.legendDot('#e5e7eb')} /> Ocupado &nbsp;
                    <span style={styles.legendDot('#10b981')} /> Selecionado
                  </p>
                  <div style={styles.slotGrid}>
                    {MOCK_SLOTS.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => handleSelectSlot(slot)}
                        style={{
                          ...styles.slotBtn,
                          background: selectedSlot === slot.time
                            ? '#10b981'
                            : slot.available ? '#eef2ff' : '#f3f4f6',
                          color: selectedSlot === slot.time
                            ? '#fff'
                            : slot.available ? '#3730a3' : '#9ca3af',
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          textDecoration: !slot.available ? 'line-through' : 'none',
                          border: selectedSlot === slot.time
                            ? '2px solid #10b981'
                            : slot.available ? '2px solid #c7d2fe' : '2px solid #e5e7eb',
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div style={styles.actions}>
                <button style={styles.btnSecondary} onClick={goBack}>← Voltar</button>
                <button
                  style={{ ...styles.btnPrimary, opacity: selectedSlot ? 1 : 0.5 }}
                  disabled={!selectedSlot}
                  onClick={goNext}
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Dados ── */}
          {step === 2 && (
            <div>
              <h2 style={styles.stepTitle}>Seus dados</h2>
              <div style={styles.form}>
                <label style={styles.label}>
                  Nome completo
                  <input
                    name="clientName"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={form.clientName}
                    onChange={handleFormChange}
                    style={styles.input}
                    autoFocus
                  />
                </label>
                <label style={styles.label}>
                  Telefone / WhatsApp
                  <input
                    name="clientPhone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={form.clientPhone}
                    onChange={handleFormChange}
                    style={styles.input}
                  />
                </label>
                {formError && (
                  <p style={styles.error} role="alert">{formError}</p>
                )}
              </div>

              {/* Mini resumo */}
              <div style={styles.miniSummary}>
                <span>📋 {selectedService?.name}</span>
                <span>📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span>🕐 {selectedSlot}</span>
              </div>

              <div style={styles.actions}>
                <button style={styles.btnSecondary} onClick={goBack}>← Voltar</button>
                <button style={styles.btnPrimary} onClick={handleConfirm}>
                  Confirmar agendamento
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>{value}</span>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f4f8',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  container: { width: '100%', maxWidth: '560px' },
  logo: { textAlign: 'center', color: '#4f46e5', marginBottom: '1.5rem' },

  // Stepper
  stepper: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '1.5rem', gap: 0 },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepDot: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700, zIndex: 1,
  },
  stepLabel: { fontSize: '0.7rem', marginTop: '0.3rem', textAlign: 'center' },
  stepLine: {
    position: 'absolute', top: '16px', left: '50%',
    width: '100%', height: '2px', zIndex: 0,
  },

  // Card
  card: {
    background: '#fff', borderRadius: '16px',
    padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  stepTitle: { margin: '0 0 1.25rem', color: '#1f2937', fontSize: '1.2rem' },

  // Serviços
  serviceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' },
  serviceCard: {
    padding: '1rem', borderRadius: '10px', cursor: 'pointer',
    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
    transition: 'all 0.15s',
  },
  serviceName: { fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' },
  serviceMeta: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  chip: {
    padding: '0.15rem 0.5rem', borderRadius: '999px',
    fontSize: '0.75rem', fontWeight: 500,
    background: '#e0e7ff', color: '#3730a3',
  },

  // Slots
  slotHint: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  legendDot: (color) => ({
    display: 'inline-block', width: '10px', height: '10px',
    borderRadius: '50%', background: color, marginRight: '2px',
  }),
  slotGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem', marginBottom: '1.25rem',
  },
  slotBtn: {
    padding: '0.5rem 0', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s',
  },

  // Form
  form: { display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: {
    padding: '0.7rem 0.875rem', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '1rem',
    outline: 'none', boxSizing: 'border-box', width: '100%',
  },
  error: {
    color: '#dc2626', fontSize: '0.875rem', margin: 0,
    background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px',
  },
  miniSummary: {
    display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
    background: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem',
    fontSize: '0.85rem', color: '#374151', marginBottom: '1.25rem',
  },

  // Actions
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  btnPrimary: {
    padding: '0.65rem 1.5rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.95rem', transition: 'opacity 0.15s',
  },
  btnSecondary: {
    padding: '0.65rem 1.25rem', background: '#f3f4f6', color: '#374151',
    border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem',
  },

  // Sucesso
  successCard: {
    background: '#fff', borderRadius: '16px', padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center',
  },
  successIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  successTitle: { color: '#10b981', margin: '0 0 0.25rem', fontSize: '1.4rem' },
  successSub: { color: '#6b7280', marginBottom: '1.5rem' },
  summaryBox: {
    background: '#f8fafc', borderRadius: '10px',
    padding: '0.5rem 1rem', marginBottom: '1rem', textAlign: 'left',
  },
  successNote: { color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' },
}
