import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Calendar, DollarSign, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Prestamos() {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDeudasCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');

        if (!token) {
          navigate('/login');
          return;
        }

        // Invocamos al endpoint de recuperaciones de tu FastAPI
        const response = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/recuperaciones/mora', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Filtramos para que el cliente logueado solo vea sus deudas (ej. cliente_id: 7 o según sesión)
          const misDeudas = data.filter(m => String(m.cliente_id) === String(userId) || m.cliente_id === 7);
          setCreditos(misDeudas);
        }
      } catch (error) {
        console.error("Error al acoplar préstamos en Homebanking:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDeudasCliente();
  }, [navigate]);

  // Helper para mapear las alertas visuales según el nivel de mora real de PostgreSQL
  const getConfigMora = (estado) => {
    switch (estado) {
      case 'mora_leve':
        return { label: 'Atraso Preventivo (1-30 días)', color: '#ca8a04', bg: '#fef9c3', border: '#fef08a' };
      case 'mora_grave':
        return { label: 'En Gestión de Campo (31-90 días)', color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' };
      case 'mora_critica':
        return { label: 'En Tramitación Judicial (+90 días)', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
      default:
        return { label: 'Crédito Activo - Al Día', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' };
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
      
      {/* NAVBAR GLOBAL COMPARTIDO */}
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
          <h2 style={{ color: '#003087', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Mis Préstamos PyME</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Consulta tus cronogramas vigentes, saldos deudores y estados de cuenta.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <strong>Consultando pasivos con el Core...</strong>
          </div>
        ) : creditos.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,.02)' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ margin: '0 0 8px', color: '#1A1A1A', fontSize: '1.1rem' }}>¡Felicidades! No registras deudas pendientes</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Actualmente tu historial crediticio con el BCP MYPE se encuentra al 100% al día.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {creditos.map((c) => {
              const config = getConfigMora(c.estado);
              const esMoroso = c.estado.includes('mora');

              return (
                <div 
                  key={c.id_prestamo} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: '14px', 
                    border: '1px solid #E0E0E0', 
                    boxShadow: '0 4px 12px rgba(0,0,0,.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Banner de Estado Superior */}
                  <div style={{ background: config.bg, padding: '12px 24px', borderBottom: `1px solid ${config.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: config.color, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {esMoroso ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {config.label}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                      ID Obligación: PRE-{c.id_prestamo}
                    </span>
                  </div>

                  {/* Cuerpo Financiero de la Tarjeta */}
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      
                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Destino del Crédito</span>
                        <strong style={{ color: '#1A1A1A', fontSize: '1.05rem' }}>{c.proposito || 'Capital de Trabajo'}</strong>
                      </div>

                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Monto Desembolsado</span>
                        <strong style={{ color: '#003087', fontSize: '1.1rem', fontWeight: 800 }}>{formatSoles(c.monto)}</strong>
                      </div>

                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Saldo Deudor de Alerta</span>
                        <strong style={{ color: esMoroso ? '#dc2626' : '#1a7a4a', fontSize: '1.1rem', fontWeight: 800 }}>
                          {formatSoles(c.saldo_pendiente)}
                        </strong>
                      </div>

                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Plazo Financiado</span>
                        <strong style={{ color: '#1A1A1A', fontSize: '1.05rem' }}>{c.plazo_meses} Meses</strong>
                      </div>

                    </div>

                    {/* Alerta de Acción de Cobranza si el cliente está en mora */}
                    {esMoroso && (
                      <div style={{ marginTop: '20px', background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '10px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <ShieldAlert size={20} color="#C53030" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <h5 style={{ margin: '0 0 4px', color: '#9B2C2C', fontWeight: 700, fontSize: '0.9rem' }}>Aviso Urgente de Regularización</h5>
                          <p style={{ margin: 0, color: '#C53030', fontSize: '0.82rem', lineHeight: '1.4' }}>
                            Detectamos cuotas pendientes asociadas a este pagaré. Por favor, acércate a una agencia BCP o comunícate con tu gestor asignado **Cristopher M.** para estructurar un compromiso de pago y evitar el incremento de los intereses moratorios y el deterioro de tu calificación en las centrales de riesgo.
                          </p>
                        </div>
                      </div>
                    )}
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