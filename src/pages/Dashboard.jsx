import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarPortal from '../components/NavbarPortal';

// ── Helpers Financieros ────────────────────────────────
const formatSoles = (n) =>
  'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatFecha = (f) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const maskCuenta = (num) => {
  if (!num) return '••• - •••••• - XXXX';
  const clean = num.toString().replace(/\s+/g, '');
  return `••• - •••••• - ${clean.slice(-4)}`;
};

// ── Estilos Inline Armoniosos BCP ──────────────────────
const S = {
  layout: { display: 'flex', minHeight: 'calc(100vh - 61px)', background: '#F5F5F5' },
  sidebar: { width: 220, background: '#003087', padding: '24px 0', flexShrink: 0 },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
};

function SideLink({ to, icon, label, active }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 24px', cursor: 'pointer',
        color: active ? '#FF6900' : 'rgba(255,255,255,.8)', fontWeight: active ? 700 : 400, fontSize: '.9rem',
        borderLeft: active ? '3px solid #FF6900' : '3px solid transparent',
        background: active ? 'rgba(255,255,255,.06)' : 'transparent', transition: 'all .15s',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </div>
  );
}

function CardCuenta({ cuenta }) {
  const esCorriente = cuenta.tipo === 'corriente' || cuenta.tipo_cuenta?.toLowerCase().includes('corriente');
  return (
    <div style={{
      background: esCorriente
        ? 'linear-gradient(135deg, #003087 0%, #0041B8 100%)'
        : 'linear-gradient(135deg, #1a7a4a 0%, #28a745 100%)',
      borderRadius: 14, padding: '20px 24px', color: '#fff', flex: '1 1 260px', minWidth: 240, maxWidth: 340, boxShadow: '0 4px 16px rgba(0,0,0,.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 20, padding: '3px 10px', fontSize: '.75rem', fontWeight: 700 }}>
            {esCorriente ? 'Cuenta Corriente PyME' : 'Cuenta de Ahorros'}
          </span>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: 8 }}>
            {maskCuenta(cuenta.numero_cuenta || cuenta.numero || '191000000000')}
          </div>
        </div>
        <span style={{ fontSize: '1.8rem', opacity: .8 }}>{esCorriente ? '💳' : '🐷'}</span>
      </div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
        {formatSoles(cuenta.saldo || cuenta.balance)}
      </div>
      <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '.8rem', marginTop: 4 }}>
        {cuenta.moneda || 'PEN'} · Saldo disponible
      </div>
    </div>
  );
}

function AccesoRapido({ icon, label, to }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        background: '#fff', border: '1px solid #E0E0E0', borderRadius: 12, padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
        transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,48,135,.08)';
        e.currentTarget.style.borderColor = '#003087';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.transform = 'none';
      }}
    >
      <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#003087' }}>{label}</span>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('Cliente');
  const [cuentas, setCuentas] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    const userId = localStorage.getItem('user_id');
    const nombreGuardado = localStorage.getItem('nombre');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    setNombre(nombreGuardado || 'Cliente');

    // CONSUMO INTEGRADO DEL ENDPOINT DE TU DASHBOARD SERVICE (Puerto 8001)
    const cargarResumenCore = async () => {
      try {
        const response = await fetch(`https://portal-financiero-bcp-backend.onrender.com/api/cuentas/resumen/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const json = await response.json();
          
          // Validamos que la respuesta sea exitosa y contenga la llave "data" de Python
          if (json.success && json.data) {
            setCuentas(json.data.cuentas || []);
            setTxns(json.data.txns || []);
          }
        }
      } catch (error) {
        console.error("Error al acoplar datos desde DashboardService:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarResumenCore();
  }, [navigate]);

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
      <NavbarPortal />

      <div style={S.layout}>
        {/* SIDEBAR NAVEGACIÓN */}
        <nav style={S.sidebar}>
          <SideLink to="/dashboard" icon="📊" label="Dashboard" active={true} />
          <SideLink to="/dashboard/cuentas" icon="🐷" label="Mis Cuentas" active={false} />
          <SideLink to="/dashboard/prestamos" icon="💰" label="Préstamos PyME" active={false} />
          <SideLink to="/dashboard/pagos" icon="💳" label="Pago Servicios" active={false} />
        </nav>

        {/* CONTENIDO MAIN */}
        <main style={S.main}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800, color: '#1A1A1A', fontSize: '1.2rem' }}>
                Bienvenido, <span style={{ color: '#003087' }}>{nombre}</span>
              </h4>
              <p style={{ margin: 0, color: '#888', fontSize: '.85rem', marginTop: 2 }}>{fechaHoy}</p>
            </div>
            <span style={{ background: '#d4edda', color: '#155724', borderRadius: 20, padding: '4px 12px', fontSize: '.8rem', fontWeight: 600 }}>
              🟢 Conexión Central Core (Port 8001)
            </span>
          </div>

          {/* Bloque Cuentas */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            {loading ? (
              <div style={{ color: '#888', padding: '10px 0' }}>Consultando saldos en PostgreSQL...</div>
            ) : cuentas.length === 0 ? (
              <div style={{ background: '#EBF5FB', border: '1px solid #b8d4e8', borderRadius: 10, padding: '14px 20px', color: '#003087', fontSize: '.9rem' }}>
                No registras cuentas de ahorros o corrientes comerciales vigentes.
              </div>
            ) : (
              cuentas.map((c, i) => <CardCuenta key={c.id || c.id_cuenta || i} cuenta={c} />)
            )}
          </div>

          {/* Operaciones */}
          <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Operaciones Frecuentes
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
            <AccesoRapido icon="🏦" label="Ver Mis Cuentas" to="/dashboard/cuentas" />
            <AccesoRapido icon="💰" label="Simular Crédito" to="/dashboard/solicitar" />
            <AccesoRapido icon="💳" label="Pago Servicios" to="/dashboard/pagos" />
          </div>

          {/* Historial de Movimientos */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.04)', border: '1px solid #E0E0E0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E0E0E0' }}>
              <span style={{ fontWeight: 700, color: '#003087', fontSize: '.95rem' }}>
                🕐 Últimos Movimientos Procesados
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>Sincronizando transacciones...</div>
            ) : txns.length === 0 ? (
              <div style={{ padding: '30px', color: '#888', textAlign: 'center' }}>No registras transacciones recientes en el sistema bancario.</div>
            ) : (
              txns.map((t, i) => {
                const esEgreso = t.tipo?.toLowerCase() === 'debito' || t.tipo_movimiento === 'EGRESO' || t.monto < 0;
                return (
                  <div key={t.id || t.id_transaccion || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: esEgreso ? '#fff5f5' : '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        {esEgreso ? '↗️' : '↙️'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#1A1A1A' }}>{t.descripcion || t.concepto || t.detalle || 'Transferencia'}</div>
                        <div style={{ color: '#888', fontSize: '.75rem' }}>{formatFecha(t.fecha)}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '.95rem', color: esEgreso ? '#c0392b' : '#1a7a4a' }}>
                      {esEgreso ? '- ' : '+ '}{formatSoles(Math.abs(t.monto))}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}