import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate  = useNavigate()
  const [docTipo, setDocTipo]   = useState('DNI')
  const [email,   setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error,   setError]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [persona, setPersona]   = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
        // ← Llama a FastAPI en vez de Supabase directo
        const res  = await fetch('http://localhost:8000/api/auth/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password })
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
            setError('Correo o contraseña incorrectos.')
            setLoading(false)
            return
        }

        // Guardar token en localStorage para usarlo después
        localStorage.setItem('access_token', json.data.access_token)
        localStorage.setItem('user_id',      json.data.user_id)
        localStorage.setItem('nombre',       json.data.nombre)

        navigate('/dashboard')

    } catch (err) {
        setError('Error de conexión con el servidor.')
    }

    setLoading(false)
}

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── PANEL IZQUIERDO AZUL ── */}
      <div style={{
        width: '34%',
        background: 'linear-gradient(160deg, rgb(5, 31, 79) 60%, #0041B8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{
          position: 'absolute', top: 28, left: 28,
          fontSize: '1.6rem', fontWeight: 900, color: '#fff',
          letterSpacing: '-1px'
        }}>
          <div className="logo">
            <img 
                src="https://logosenvector.com/logo/img/banco-de-credito-bcp-82.jpg" 
                alt="Logo BCP"
                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
            />
        </div>
        </div>

        {/* Círculo decorativo */}
        <div style={{
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.08)',
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)'
        }} />

        {/* Ilustración placeholder */}
        <div style={{
          width: 260, height: 260,
          background: 'rgba(255,255,255,.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '6rem',
          zIndex: 2
        }}>
          🏦
        </div>

        <p style={{
          color: 'rgba(255,255,255,.7)',
          fontSize: '.85rem',
          textAlign: 'center',
          marginTop: 20,
          zIndex: 2
        }}>
          Banca digital segura y confiable
        </p>
      </div>

      {/* ── PANEL DERECHO BLANCO ── */}
      <div style={{
        flex: 1,
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative'
      }}>

        {/* Timer top right */}
        <div style={{
          position: 'absolute', top: 20, right: 28,
          fontSize: '.8rem', color: '#888', display: 'flex',
          alignItems: 'center', gap: 6
        }}>
          Esta ventana se cerrará en <strong style={{ color: '#003087' }}>300</strong> segundos ⏱
        </div>

        {/* Volver */}
        <div style={{ position: 'absolute', top: 20, left: 28 }}>
          <Link to="/" style={{
            color: '#FF6900', textDecoration: 'none',
            fontSize: '.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            ← Volver
          </Link>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: '#003087', marginBottom: 4
          }}>
            Banca por Internet
          </h2>
          <p style={{ color: '#888', fontSize: '.85rem' }}>
            Ingresa con tu correo y contraseña
          </p>
        </div>

        {/* Card del formulario */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '32px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,48,135,.1)',
          border: '1px solid #e8eef5'
        }}>

          {/* Tab Tarjeta y clave */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20, paddingBottom: 16,
            borderBottom: '2px solid #003087'
          }}>
            <span style={{ fontSize: '1.2rem' }}>💳</span>
            <span style={{
              color: '#003087', fontWeight: 700, fontSize: '.95rem'
            }}>
              Correo y contraseña
            </span>
          </div>

          {/* Persona / Empresa */}
          <div style={{
            display: 'flex', gap: 24, marginBottom: 20
          }}>
            {['Persona', 'Empresa'].map((op, i) => (
              <label key={op} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', fontSize: '.9rem', fontWeight: 500
              }}>
                <input type="radio" name="tipo"
                  checked={persona === (i === 0)}
                  onChange={() => setPersona(i === 0)}
                  style={{ accentColor: '#FF6900', width: 16, height: 16 }} />
                {op}
              </label>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FEB2B2',
              borderRadius: 8, padding: '10px 14px', color: '#C53030',
              fontSize: '.85rem', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Correo */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                border: '1.5px solid #ddd', borderRadius: 10,
                overflow: 'hidden', position: 'relative'
              }}>
                <label style={{
                  position: 'absolute', top: 6, left: 14,
                  fontSize: '.7rem', color: '#888', fontWeight: 500
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    padding: '24px 14px 8px',
                    fontSize: '.95rem', background: 'transparent'
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 8 }}>
              <div style={{
                border: '1.5px solid #ddd', borderRadius: 10,
                overflow: 'hidden', position: 'relative'
              }}>
                <label style={{
                  position: 'absolute', top: 6, left: 14,
                  fontSize: '.7rem', color: '#888', fontWeight: 500
                }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    padding: '24px 14px 8px',
                    fontSize: '.95rem', background: 'transparent'
                  }}
                />
              </div>
            </div>

            {/* Links */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 24
            }}>
              <span style={{
                color: '#FF6900', fontSize: '.82rem',
                cursor: 'pointer', fontWeight: 600
              }}>
                Crear cuenta
              </span>
              <Link to="/registro" style={{
                color: '#FF6900', fontSize: '.82rem',
                fontWeight: 600, textDecoration: 'none'
              }}>
                ¿Olvidé mi contraseña?
              </Link>
            </div>

            {/* Botón */}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#ffb366' : '#FF6900',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 32,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .2s',
              letterSpacing: '.3px'
            }}>
              {loading ? 'Verificando...' : 'Continuar'}
            </button>

          </form>

          {/* Registro */}
          <div style={{
            textAlign: 'center', marginTop: 20,
            fontSize: '.83rem', color: '#888'
          }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{
              color: '#003087', fontWeight: 700, textDecoration: 'none'
            }}>
              Regístrate aquí
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}