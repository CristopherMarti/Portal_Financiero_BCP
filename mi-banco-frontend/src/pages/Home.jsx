import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const servicios = [
  { icono: '🐷', label: 'Abre una cuenta',        badge: null },
  { icono: '💳', label: 'Obtener una Tarjeta',    badge: null },
  { icono: '💰', label: 'Solicitar un Préstamo',  badge: null },
  { icono: '💵', label: 'Adelantar mi Sueldo',    badge: null },
  { icono: '🚗', label: 'SOAT Virtual',           badge: 'Promo' },
  { icono: '🛡️', label: 'Proteger mis Tarjetas',  badge: null },
  { icono: '🎁', label: 'Ver mis beneficios',     badge: null },
  { icono: '❓', label: 'Ir a Ayuda Rápida',      badge: null },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-texto">
            <h1>¡Banca digital segura y rápida!</h1>
            <p>Gestiona tus finanzas desde cualquier lugar,<br/>en cualquier momento.</p>
            <button className="btn-hero" onClick={() => navigate('/login')}>
              Pídelo aquí
            </button>
          </div>
        </div>
        <div>
          <img src="https://mejorconsalud.as.com/wp-content/uploads/2018/07/importancia-reir-familia.jpg?auto=format%2Ccompress&quality=75&width=640&height=360&fit=cover&gravity=center&sharp=true&progressive=true" alt="Familia feliz" />
        </div>
        <div className="hero-dots">
          <span className="active" /><span /><span />
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="section-servicios">
        <div className="section-inner">
          <h2>¿Qué necesitas hacer hoy?</h2>
          <div className="servicios-grid">
            {servicios.map((s, i) => (
              <div key={i} className="servicio-card">
                {s.badge && <span className="badge-card">{s.badge}</span>}
                <div className="icono">{s.icono}</div>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PANEL MI ESPACIO ── */}
      <section className="section-split">
        <div className="split-inner">
          <div>
            <h2 style={{ color: 'var(--bcp-azul)', fontSize: '1.5rem',
              fontWeight: 800, marginBottom: 20 }}>
              Productos para ti
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['Préstamos','Tarjetas','Cuentas','Seguros'].map(p => (
                <div key={p} style={{ border: '1px solid #e0e0e0', borderRadius: 12,
                  padding: '20px', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,48,135,.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ fontWeight: 700, color: 'var(--bcp-azul)',
                    fontSize: '.95rem' }}>{p}</div>
                  <div style={{ color: '#888', fontSize: '.8rem', marginTop: 4 }}>
                    Conoce más →
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-espacio">
            <span className="badge-panel">Mi Espacio</span>
            <h3>¡Conoce tus productos preaprobados!</h3>
            <p>Solo con tu número de documento.<br/>Para clientes y no clientes.</p>
            <div className="dni-input">
              <select><option>DNI</option><option>CE</option></select>
              <input type="text" placeholder="Nro Documento" />
            </div>
            <button className="btn-conocer">Conocer</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-bcp">
        <div className="footer-logo">›MIBANCO</div>
        <p>© 2026 Mi Banco — Portal de Banca en Línea · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}