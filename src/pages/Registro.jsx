import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Registro() {
  const navigate = useNavigate()
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [exito,    setExito]    = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8)  { setError('La contraseña debe tener mínimo 8 caracteres.'); return }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre } }
    })

    setLoading(false)
    if (error) {
      let msg = 'Error al crear la cuenta.'
      if (error.message.includes('already registered')) msg = 'Este correo ya está registrado.'
      setError(msg)
      return
    }
    setExito(true)
  }

  // Campo flotante — mismo estilo que Login
  const Field = ({ label, type, value, onChange, minLen }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        border: '1.5px solid #ddd',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        background: '#fff'
      }}>
        <label style={{
          position: 'absolute', top: 6, left: 14,
          fontSize: '.7rem', color: '#888', fontWeight: 500,
          pointerEvents: 'none'
        }}>
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          minLength={minLen}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            padding: '24px 14px 8px',
            fontSize: '.95rem',
            background: 'transparent',
            color: '#111',          /* ← fix texto invisible */
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  )

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
        <div style={{ position: 'absolute', top: 28, left: 28 }}>
          <img
            src="https://logosenvector.com/logo/img/banco-de-credito-bcp-82.jpg"
            alt="Logo BCP"
            style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
          />
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

        {/* Ilustración */}
        <div style={{
          width: 220, height: 220,
          background: 'rgba(255,255,255,.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5rem',
          zIndex: 2
        }}>
          👤
        </div>

        <p style={{
          color: 'rgba(255,255,255,.75)',
          fontSize: '.9rem',
          textAlign: 'center',
          marginTop: 20,
          zIndex: 2,
          fontWeight: 500
        }}>
          Únete a la banca digital
        </p>
        <p style={{
          color: 'rgba(255,255,255,.5)',
          fontSize: '.8rem',
          textAlign: 'center',
          marginTop: 4,
          zIndex: 2
        }}>
          Segura y confiable
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
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: '#003087', marginBottom: 4
          }}>
            Crear cuenta
          </h2>
          <p style={{ color: '#888', fontSize: '.85rem' }}>
            Completa tus datos para registrarte
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '32px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,48,135,.1)',
          border: '1px solid #e8eef5'
        }}>

          {/* Header card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20, paddingBottom: 16,
            borderBottom: '2px solid #003087'
          }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <span style={{ color: '#003087', fontWeight: 700, fontSize: '.95rem' }}>
              Datos de registro
            </span>
          </div>

          {/* Éxito */}
          {exito && (
            <div style={{
              background: '#F0FFF4', border: '1px solid #9AE6B4',
              borderRadius: 8, padding: '10px 14px', color: '#276749',
              fontSize: '.85rem', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ✅ Cuenta creada.{' '}
              <Link to="/login" style={{ color: '#003087', fontWeight: 700 }}>
                Inicia sesión aquí
              </Link>
            </div>
          )}

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

          {!exito && (
            <form onSubmit={handleSubmit}>
              <Field label="Nombre completo"     type="text"     value={nombre}   onChange={setNombre}   />
              <Field label="Correo electrónico"  type="email"    value={email}    onChange={setEmail}    />
              <Field label="Contraseña"          type="password" value={password} onChange={setPassword} minLen={8} />
              <Field label="Confirmar contraseña" type="password" value={confirm}  onChange={setConfirm}  minLen={8} />

              <button
                type="submit"
                disabled={loading}
                style={{
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
                  letterSpacing: '.3px',
                  marginTop: 8
                }}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {/* Link login */}
          <div style={{
            textAlign: 'center', marginTop: 20,
            fontSize: '.83rem', color: '#888'
          }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: '#003087', fontWeight: 700, textDecoration: 'none'
            }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}