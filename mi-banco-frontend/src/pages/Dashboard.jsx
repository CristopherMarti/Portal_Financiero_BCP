import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

// ── Helpers ────────────────────────────────────────────
const formatSoles = (n) =>
  'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatFecha = (f) => {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const maskCuenta = (num) => {
  if (!num) return '****'
  const parts = num.split('-')
  return parts.length > 1
    ? `••• - •••••• - ${parts[parts.length - 1].slice(-4)}`
    : `•••• •••• ${num.slice(-4)}`
}

// ── Estilos inline reutilizables ───────────────────────
const S = {
  navbar: {
    background: '#fff',
    borderBottom: '1px solid #E0E0E0',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
  },
  navbarInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 32px',
    maxWidth: 1400,
    margin: '0 auto',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#003087',
    textDecoration: 'none',
    letterSpacing: '-1px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 57px)',
    background: '#F5F5F5',
  },
  sidebar: {
    width: 220,
    background: '#003087',
    padding: '24px 0',
    flexShrink: 0,
  },
  main: {
    flex: 1,
    padding: '28px 32px',
    overflowY: 'auto',
  },
}

// ── Sidebar link ───────────────────────────────────────
function SideLink({ to, icon, label, active }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 24px',
        cursor: 'pointer',
        color: active ? '#FF6900' : 'rgba(255,255,255,.8)',
        fontWeight: active ? 700 : 400,
        fontSize: '.9rem',
        borderLeft: active ? '3px solid #FF6900' : '3px solid transparent',
        background: active ? 'rgba(255,255,255,.08)' : 'transparent',
        transition: 'all .15s',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </div>
  )
}

// ── Tarjeta de cuenta ──────────────────────────────────
function CardCuenta({ cuenta }) {
  const esCorriente = cuenta.tipo === 'corriente'
  return (
    <div style={{
      background: esCorriente
        ? 'linear-gradient(135deg, #003087 0%, #0041B8 100%)'
        : 'linear-gradient(135deg, #1a7a4a 0%, #28a745 100%)',
      borderRadius: 14,
      padding: '20px 24px',
      color: '#fff',
      flex: '1 1 260px',
      minWidth: 240,
      maxWidth: 340,
      boxShadow: '0 4px 16px rgba(0,0,0,.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <span style={{
            background: 'rgba(255,255,255,.2)',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: '.75rem',
            fontWeight: 700,
          }}>
            {esCorriente ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
          </span>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: 8 }}>
            {maskCuenta(cuenta.numero_cuenta)}
          </div>
        </div>
        <span style={{ fontSize: '1.8rem', opacity: .8 }}>
          {esCorriente ? '💳' : '🐷'}
        </span>
      </div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
        {formatSoles(cuenta.saldo)}
      </div>
      <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '.8rem', marginTop: 4 }}>
        {cuenta.moneda} · Saldo disponible
      </div>
    </div>
  )
}

// ── Acceso rápido ──────────────────────────────────────
function AccesoRapido({ icon, label, to }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        background: '#fff',
        border: '1px solid #E0E0E0',
        borderRadius: 12,
        padding: '18px 12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all .2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,48,135,.12)'
        e.currentTarget.style.borderColor = '#003087'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#E0E0E0'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#003087' }}>{label}</span>
    </div>
  )
}

// ── Componente principal ───────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate()
  const [user,    setUser]    = useState(null)
  const [cuentas, setCuentas] = useState([])
  const [txns,    setTxns]    = useState([])
  const [loadingCuentas, setLoadingCuentas] = useState(true)
  const [loadingTxns,    setLoadingTxns]    = useState(true)

  useEffect(() => {
    const token  = localStorage.getItem('access_token')
    const userId = localStorage.getItem('user_id')
    const nombre = localStorage.getItem('nombre')

    // Si no hay token, redirigir al login
    if (!token || !userId) { navigate('/login'); return }

    setUser({ id: userId, nombre })

    // Cuentas y transacciones siguen desde Supabase por ahora
    const cargar = async () => {
        const { data: c } = await supabase
        .from('cuentas').select('*')
        .eq('user_id', userId).order('tipo')
        setCuentas(c || [])
        setLoadingCuentas(false)

        const { data: t } = await supabase
        .from('transacciones').select('*')
        .eq('user_id', userId)
        .order('fecha', { ascending: false }).limit(5)
        setTxns(t || [])
        setLoadingTxns(false)
    }
    cargar()
    }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nombre = user?.user_metadata?.full_name?.split(' ')[0] || user?.email || 'Cliente'
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>

      {/* ── NAVBAR ── */}
      <nav style={S.navbar}>
        <div style={S.navbarInner}>
          <span style={S.brand}>
            
            <img
              src="https://logovtor.com/wp-content/uploads/2020/03/banco-de-credito-del-peru-bcp-logo-vector.png"
              alt="BCP"
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#FF6900', fontWeight: 600, fontSize: '.9rem' }}>
              👤 {nombre}
            </span>
            <button
              onClick={handleLogout}
              style={{
                border: '1.5px solid #003087',
                color: '#003087',
                background: 'transparent',
                padding: '7px 18px',
                borderRadius: 20,
                fontWeight: 600,
                fontSize: '.85rem',
                cursor: 'pointer',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div style={S.layout}>

        {/* SIDEBAR */}
        <nav style={S.sidebar}>
          <SideLink to="/dashboard"     icon="📊" label="Dashboard"      active={true}  />
          <SideLink to="/transacciones" icon="↔️"  label="Transacciones"  active={false} />
          <SideLink to="/pagos"         icon="💳" label="Pagos"          active={false} />
          <SideLink to="/prestamos"     icon="💰" label="Préstamos"      active={false} />
          <SideLink to="/ahorro"        icon="🐷" label="Ahorro"         active={false} />
        </nav>

        {/* MAIN */}
        <main style={S.main}>

          {/* Saludo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800, color: '#1A1A1A', fontSize: '1.2rem' }}>
                Bienvenido, <span style={{ color: '#003087' }}>{nombre}</span>
              </h4>
              <p style={{ margin: 0, color: '#888', fontSize: '.85rem', marginTop: 2 }}>{fechaHoy}</p>
            </div>
            <span style={{
              background: '#d4edda', color: '#155724',
              borderRadius: 20, padding: '4px 12px',
              fontSize: '.8rem', fontWeight: 600,
            }}>
              🟢 En línea
            </span>
          </div>

          {/* Tarjetas de saldo */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            {loadingCuentas ? (
              <div style={{ color: '#888', padding: '20px 0' }}>Cargando cuentas...</div>
            ) : cuentas.length === 0 ? (
              <div style={{
                background: '#EBF5FB', border: '1px solid #b8d4e8',
                borderRadius: 10, padding: '14px 20px',
                color: '#003087', fontSize: '.9rem'
              }}>
                No se encontraron cuentas asociadas.
              </div>
            ) : (
              cuentas.map(c => <CardCuenta key={c.id} cuenta={c} />)
            )}
          </div>

          {/* Accesos rápidos */}
          <p style={{
            fontSize: '.75rem', fontWeight: 700, color: '#888',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12
          }}>
            Accesos rápidos
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 12, marginBottom: 28
          }}>
            <AccesoRapido icon="↔️"  label="Transacciones"  to="/transacciones" />
            <AccesoRapido icon="💳" label="Pagos"           to="/pagos"         />
            <AccesoRapido icon="💰" label="Préstamos"       to="/prestamos"     />
            <AccesoRapido icon="🐷" label="Ahorro"          to="/ahorro"        />
            <AccesoRapido icon="📱" label="QR Pago"         to="#"              />
          </div>

          {/* Últimas transacciones */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,.06)',
            border: '1px solid #E0E0E0',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #E0E0E0'
            }}>
              <span style={{ fontWeight: 700, color: '#003087', fontSize: '.95rem' }}>
                🕐 Últimos movimientos
              </span>
              <button
                onClick={() => navigate('/transacciones')}
                style={{
                  border: '1.5px solid #003087', color: '#003087',
                  background: 'transparent', padding: '5px 14px',
                  borderRadius: 20, fontSize: '.8rem',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ver todos
              </button>
            </div>

            {loadingTxns ? (
              <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                Cargando movimientos...
              </div>
            ) : txns.length === 0 ? (
              <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                Sin movimientos recientes.
              </div>
            ) : (
              txns.map(t => (
                <div key={t.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: t.tipo === 'debito' ? '#fff5f5' : '#f0fff4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', flexShrink: 0
                    }}>
                      {t.tipo === 'debito' ? '↗️' : '↙️'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#1A1A1A' }}>
                        {t.descripcion}
                      </div>
                      <div style={{ color: '#888', fontSize: '.75rem' }}>
                        {formatFecha(t.fecha)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '.95rem',
                    color: t.tipo === 'debito' ? '#c0392b' : '#1a7a4a'
                  }}>
                    {t.tipo === 'debito' ? '- ' : '+ '}{formatSoles(t.monto)}
                  </span>
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </div>
  )
}