import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Landmark, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const maskCuenta = (num) => {
  if (!num) return '•••• - •••••• - XXXX';
  const clean = num.toString().replace(/\s+/g, '');
  return `••• - •••••• - ${clean.slice(-4)}`;
};

export default function Cuentas() {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarSaldosCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        
        if (!token || !userId) {
          navigate('/login');
          return;
        }

        // Consultamos el resumen de ahorros en tu FastAPI (Puerto 8001)
        // Mapeado con el prefijo /api/cuentas en tu main.py
        const response = await fetch(`https://portal-financiero-bcp-backend.onrender.com/api/cuentas/resumen/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const json = await response.json();
          
          // Desencapsulamos la llave "data" e ingresamos al array de cuentas
          if (json.success && json.data) {
            setCuentas(json.data.cuentas || []);
          } else if (Array.isArray(json)) {
            // Por si tu controlador de ahorros devuelve el array directo
            setCuentas(json);
          }
        }
      } catch (error) {
        console.error("Error al acoplar cuentas en Homebanking:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarSaldosCliente();
  }, [navigate]);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
      <NavbarPortal />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Botón de retorno */}
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: '#003087', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '24px', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#003087', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Mis Cuentas Bancarias</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Administra los fondos de tus cuentas operativas, corrientes corporativas y fondos de ahorro PyME.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <strong>Consultando saldos en tiempo real con la sucursal...</strong>
          </div>
        ) : cuentas.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
            <Landmark size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ margin: '0 0 8px', color: '#1A1A1A' }}>No registras cuentas activas</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Acércate a una sucursal del banco para aperturar una línea corriente para tu negocio.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {cuentas.map((c, i) => {
              const esCorriente = c.tipo?.toLowerCase().includes('corriente');
              
              return (
                <div 
                  key={c.id || c.id_cuenta || i} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: '14px', 
                    border: '1px solid #E0E0E0', 
                    boxShadow: '0 4px 12px rgba(0,0,0,.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '12px', 
                        background: esCorriente ? '#003087' : '#1a7a4a', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
                      }}>
                        {esCorriente ? <CreditCard size={24} /> : <Landmark size={24} />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', color: '#1A1A1A', fontSize: '1.1rem', fontWeight: 700 }}>
                          {esCorriente ? 'Cuenta Corriente PyME Soles' : 'Cuenta de Ahorros Negocio'}
                        </h4>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                          Número: {maskCuenta(c.numero_cuenta || c.numero)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Saldo Disponible</span>
                      <strong style={{ color: '#003087', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        {formatSoles(c.saldo)}
                      </strong>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>PEN · Fondos libres</small>
                    </div>
                  </div>

                  {/* Fila de Acciones Rápidas */}
                  <div style={{ background: '#f8fafc', padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                    <button 
                      onClick={() => navigate('/dashboard/pagos')}
                      style={{ background: 'transparent', border: 'none', color: '#003087', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ArrowUpRight size={14} /> Amortizar un Crédito
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}