import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.header}>
            <h1 style={s.logo}>Prime<span style={s.logoSpan}>trade</span></h1>
            <p style={s.subtitle}>Welcome Back!</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formGroup}>
              <label style={s.label}>📧 Email</label>
              <input 
                type="email" 
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                style={s.input}
                required
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>🔐 Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                style={s.input}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{...s.btn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '✨ Sign In'}
            </button>
          </form>

          <div style={s.divider}>
            <span style={s.dividerText}>New here?</span>
          </div>

          <Link to="/register" style={{textDecoration: 'none'}}>
            <button style={s.btnSecondary}>Create Account</button>
          </Link>
        </div>

        <div style={s.illustration}>
          <div style={s.circle}></div>
          <div style={s.circle2}></div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { 
    minHeight: '100vh', 
    width: '100%',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    padding: '20px',
    gap: '50px',
    alignItems: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '450px',
    backdropFilter: 'blur(10px)',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
  },
  logoSpan: {
    color: '#764ba2',
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    margin: '0',
    fontWeight: '500',
  },
  form: {
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    color: '#333',
    background: '#f9f9f9',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
    ':focus': {
      borderColor: '#667eea',
      background: 'white',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    }
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '16px',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
  },
  btnSecondary: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    background: 'transparent',
    color: '#667eea',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  divider: {
    position: 'relative',
    marginBottom: '20px',
    textAlign: 'center',
  },
  dividerText: {
    color: '#999',
    fontSize: '14px',
    padding: '0 12px',
    background: 'white',
  },
  illustration: {
    flex: 1,
    height: '400px',
    position: 'relative',
    display: 'none',
  },
  circle: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    top: '0',
    right: '0',
  },
  circle2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    bottom: '0',
    left: '0',
  },
}
