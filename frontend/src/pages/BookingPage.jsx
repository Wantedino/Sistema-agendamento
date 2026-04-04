import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const STEPS = ['Serviço', 'Horário', 'Seus dados', 'Confirmação']

export default function BookingPage() {
  const { userId } = useParams()
  const [step, setStep] = useState(0)

  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)

  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [form, setForm] = useState({ clientName: '', clientPhone: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // Carrega serviços públicos do prestador
  useEffect(() => {
    api.get(`/public/${userId}/services`)
      .then(r => setServices(r.data))
      .catch(() => setApiError('Não foi possível carregar os serviços.'))
      .finally(() => setLoadingServices(false))
  }, [userId])

  // Carrega slots quando data ou serviço mudam
  useEffect(() => {
    if (!selectedService || !selectedDate) return
    setLoadingSlots(true)
    setSelectedSlot('')
    api.get(`/public/${userId}/slots`, {
      params: { serviceId: selectedService._id, date: selectedDate },
    })
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedService, selectedDate, userId])

  function handleFormChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleConfirm() {
    setFormError('')
    if (!form.clientName.trim()) return setFormError('Informe seu nome.')
    if (!form.clientPhone.trim()) return setFormError('Informe seu telefone.')

    setSubmitting(true)
    try {
      await api.post('/appointments', {
        userId,
        serviceId: selectedService._id,
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        date: selectedDate,
        time: selectedSlot,
      })
      setSuccess(true)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao confirmar agendamento.')
    } finally {
      setSubmitting(false)
    }
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
              <SummaryRow label="Valor" value={`R$ ${Number(selectedService.price).toFixed(2)}`} />
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

  // ── Erro fatal (prestador não encontrado) ────────────────────────
  if (!loadingServices && apiError) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ ...styles.successCard, textAlign: 'center' }}>
            <p style={{ fontSize: '2rem' }}>😕</p>
            <p style={{ color: '#ef4444' }}>{apiError}</p>
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
                  <div style={{ ...styles.stepLine, background: done ? '#10b981' : '#e5e7eb' }} />
                )}
              </div>
            )
          })}
        </div>

        <div style={styles.card}>

          {/* ── Step 0: Serviço ── */}
          {step === 0 && (
            <div>
              <h2 style={styles.stepTitle}>Escolha o serviço</h2>
              {loadingServices ? (
                <p style={styles.hint}>Carregando serviços...</p>
              ) : (
                <div style={styles.serviceGrid}>
                  {services.map(s => (
                    <button
                      key={s._id}
                      onClick={() => setSelectedService(s)}
                      style={{
                        ...styles.serviceCard,
                        border: selectedService?._id === s._id ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                        background: selectedService?._id === s._id ? '#eef2ff' : '#fff',
                      }}
                    >
                      <span style={styles.serviceName}>{s.name}</span>
                      <div style={styles.serviceMeta}>
                        <span style={styles.chip}>⏱ {s.duration} min</span>
                        <span style={{ ...styles.chip, background: '#d1fae5', color: '#065f46' }}>
                          R$ {Number(s.price).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div style={styles.actions}>
                <button
                  style={{ ...styles.btnPrimary, opacity: selectedService ? 1 : 0.5 }}
                  disabled={!selectedService}
                  onClick={() => setStep(1)}
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
                  onChange={e => setSelectedDate(e.target.value)}
                  style={styles.input}
                />
              </label>

              {selectedDate && (
                <>
                  <p style={styles.slotHint}>
                    <span style={dot('#4f46e5')} /> Disponível &nbsp;
                    <span style={dot('#d1d5db')} /> Ocupado &nbsp;
                    <span style={dot('#10b981')} /> Selecionado
                  </p>
                  {loadingSlots ? (
                    <p style={styles.hint}>Carregando horários...</p>
                  ) : slots.length === 0 ? (
                    <p style={styles.hint}>Nenhum horário disponível para esta data.</p>
                  ) : (
                    <div style={styles.slotGrid}>
                      {slots.map(slot => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          style={{
                            ...styles.slotBtn,
                            background: selectedSlot === slot.time ? '#10b981' : slot.available ? '#eef2ff' : '#f3f4f6',
                            color: selectedSlot === slot.time ? '#fff' : slot.available ? '#3730a3' : '#9ca3af',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            textDecoration: !slot.available ? 'line-through' : 'none',
                            border: selectedSlot === slot.time ? '2px solid #10b981' : slot.available ? '2px solid #c7d2fe' : '2px solid #e5e7eb',
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div style={styles.actions}>
                <button style={styles.btnSecondary} onClick={() => setStep(0)}>← Voltar</button>
                <button
                  style={{ ...styles.btnPrimary, opacity: selectedSlot ? 1 : 0.5 }}
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
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
                {formError && <p style={styles.error} role="alert">{formError}</p>}
              </div>

              <div style={styles.miniSummary}>
                <span>📋 {selectedService?.name}</span>
                <span>📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span>🕐 {selectedSlot}</span>
              </div>

              <div style={styles.actions}>
                <button style={styles.btnSecondary} onClick={() => setStep(1)}>← Voltar</button>
                <button
                  style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}
                  disabled={submitting}
                  onClick={handleConfirm}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
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

function dot(color) {
  return { display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 2 }
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' },
  container: { width: '100%', maxWidth: '560px' },
  logo: { textAlign: 'center', color: '#4f46e5', marginBottom: '1.5rem' },
  stepper: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '1.5rem', gap: 0 },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, zIndex: 1 },
  stepLabel: { fontSize: '0.7rem', marginTop: '0.3rem', textAlign: 'center' },
  stepLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, zIndex: 0 },
  card: { background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  stepTitle: { margin: '0 0 1.25rem', color: '#1f2937', fontSize: '1.2rem' },
  hint: { color: '#6b7280', fontSize: '0.9rem', padding: '1rem 0' },
  serviceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' },
  serviceCard: { padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'all 0.15s' },
  serviceName: { fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' },
  serviceMeta: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  chip: { padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: '#e0e7ff', color: '#3730a3' },
  slotHint: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' },
  slotBtn: { padding: '0.5rem 0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.15s' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: { padding: '0.7rem 0.875rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', width: '100%' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: 0, background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px' },
  miniSummary: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#374151', marginBottom: '1.25rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  btnPrimary: { padding: '0.65rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'opacity 0.15s' },
  btnSecondary: { padding: '0.65rem 1.25rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem' },
  successCard: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
  successIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  successTitle: { color: '#10b981', margin: '0 0 0.25rem', fontSize: '1.4rem' },
  successSub: { color: '#6b7280', marginBottom: '1.5rem' },
  summaryBox: { background: '#f8fafc', borderRadius: '10px', padding: '0.5rem 1rem', marginBottom: '1rem', textAlign: 'left' },
  successNote: { color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' },
}
