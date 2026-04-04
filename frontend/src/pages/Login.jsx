import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(form)
      } else {
        await login(form.email, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function toggleMode() {
    setIsRegister(v => !v)
    setError('')
    setForm({ name: '', email: '', password: '', businessName: '' })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Agenda Pro</h1>
        <p style={styles.subtitle}>{isRegister ? 'Crie sua conta' : 'Entre na sua conta'}</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {isRegister && (
            <>
              <label style={styles.label}>
                Nome
                <input
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  autoComplete="name"
                />
              </label>
              <label style={styles.label}>
                Nome do negócio
                <input
                  name="businessName"
                  type="text"
                  placeholder="Ex: Barbearia do João"
                  value={form.businessName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </label>
            </>
          )}

          <label style={styles.label}>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            Senha
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {error && (
            <div style={styles.errorBox} role="alert">
              {error}
            </div>
          )}

          <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <span style={styles.link} onClick={toggleMode} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && toggleMode()}>
            {isRegister ? 'Entrar' : 'Cadastrar grátis'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#4f46e5',
    fontSize: '1.75rem',
    marginBottom: '0.25rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '1.5rem',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.75rem',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.25rem',
    transition: 'opacity 0.15s',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '0.65rem 0.875rem',
    fontSize: '0.875rem',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '1.25rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  link: {
    color: '#4f46e5',
    cursor: 'pointer',
    fontWeight: 600,
  },
}
