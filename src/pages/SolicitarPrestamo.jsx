import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SolicitarPrestamo() {
  const navigate = useNavigate();

  // Estados del Formulario MYPE
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('12');
  const [proposito, setProposito] = useState('Capital de Trabajo');
  const [tea] = useState(14.00); // Tasa base comercial del BCP

  // Estados de la Respuesta de FastAPI
  const [loadingSimulacion, setLoadingSimulacion] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);
  const [cuotaReferencial, setCuotaReferencial] = useState(null);
  const [cronograma, setCronograma] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // --- 1. SIMULACIÓN REFERENCIAL (SISTEMA FRANCÉS LOCAL) ---
  const handleSimularCuotas = (e) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un monto válido.');
      return;
    }

    setLoadingSimulacion(true);
    setError('');

    try {
      // ── MÁTICA LOCAL (Evitamos el fetch fallido al puerto 8000) ──
      const p = parseFloat(monto);
      const n = parseInt(plazo);
      const tem = Math.pow(1 + tea / 100, 1 / 12) - 1; // Conversión de TEA a TEM
      const cuota = (p * tem) / (1 - Math.pow(1 + tem, -n));

      setCuotaReferencial(cuota);

      // Armamos las filas de la tabla al instante
      let saldo = p;
      const filas = [];
      for (let i = 1; i <= n; i++) {
        const interes = saldo * tem;
        const capital = cuota - interes;
        saldo -= capital;
        
        filas.push({
          nro: i,
          fecha: `Mes ${i}`,
          capital: capital,
          interes: interes,
          cuota: cuota
        });
      }
      
      // Seteamos el estado para que pinte la grilla a la derecha
      setCronograma(filas);

    } catch (err) {
      setError('Ocurrió un error al procesar las tasas matemáticas.');
    } finally {
      setLoadingSimulacion(false);
    }
  };


  // --- 2. ENVIAR SOLICITUD REAL A TU BACKEND PYTHON (POSTGRESQL) ---
  const handleRegistrarSolicitud = async () => {
    setLoadingSolicitud(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id') || "7"; // Recupera el id del cliente logueado

      // Golpeamos tu endpoint real en el puerto 8001
      const response = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/prestamos/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Enviamos el diccionario plano que tu PrestamoService desempaqueta en Python
        body: JSON.stringify({
          cliente_id: parseInt(userId),
          monto: parseFloat(monto),
          plazo_meses: parseInt(plazo),
          proposito: proposito,
          estado: "pendiente" // Entra limpio a la bandeja evaluadora
        })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setExito(true);
      } else {
        setError(json.detail || 'Tu modelo de base de datos rechazó el registro de la solicitud.');
      }
    } catch (err) {
      console.error("Error al impactar el Core:", err);
      setError('Error de comunicación con el Core Bancario en el puerto 8001.');
    } finally {
      setLoadingSolicitud(false);
    }
  };

  if (exito) {
    return (
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
        <NavbarPortal />
        <div style={{ maxWidth: '550px', margin: '60px auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #E0E0E0', boxShadow: '0 4px 20px rgba(0,0,0,.05)', textAlign: 'center' }}>
          <CheckCircle size={56} color="#16a34a" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#003087', margin: '0 0 8px', fontWeight: 800 }}>¡Solicitud Enviada de Forma Conforme!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: '1.5' }}>
            El requerimiento financiero por <strong style={{ color: '#FF6900' }}>{formatSoles(monto)}</strong> fue inyectado con éxito en las tablas del Core Bancario. Ya se encuentra disponible en tu panel de control de analista para iniciar la evaluación del riesgo.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#003087', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '32px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            Ir a mi Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
      <NavbarPortal />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#003087', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '24px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: '#003087', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 6px' }}>Simulador y Solicitud de Créditos MYPE</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Simula los pagos fijos de tu negocio y gatilla el envío directo al panel de evaluación del banco.</p>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '12px', color: '#C53030', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '28px', alignItems: 'start' }}>
          
          {/* FORMULARIO */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,.02)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#003087', fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <Calculator size={18} /> Configura el Crédito
            </h3>

            <form onSubmit={handleSimularCuotas} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Monto Requerido (Soles)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', fontWeight: 700, color: '#1A1A1A' }}>S/</span>
                  <input 
                    type="number" 
                    value={monto} 
                    onChange={e => setMonto(e.target.value)} 
                    placeholder="Ej. 15000" 
                    required 
                    style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1.05rem', fontWeight: 700, color: '#003087' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Plazo Solicitado</label>
                <select value={plazo} onChange={e => setPlazo(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
                  <option value="6">6 Meses</option>
                  <option value="12">12 Meses</option>
                  <option value="18">18 Meses</option>
                  <option value="24">24 Meses</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Destino Comercial</label>
                <select value={proposito} onChange={e => setProposito(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
                  <option value="Capital de Trabajo">Capital de Trabajo (Mercadería)</option>
                  <option value="Activo Fijo">Activo Fijo (Maquinarias / Local)</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tasa Preferencial MYPE (TEA):</span>
                <strong style={{ color: '#16a34a', fontSize: '1rem' }}>{tea}.00% Anual</strong>
              </div>

              <button type="submit" disabled={loadingSimulacion} style={{ width: '100%', background: '#003087', color: '#fff', border: 'none', padding: '12px', borderRadius: '32px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                {loadingSimulacion ? 'Procesando...' : 'Calcular Simulación'}
              </button>
            </form>
          </div>

          {/* CUADRO DE RESULTADOS */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,.02)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#003087', fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <FileText size={18} /> Plan de Cuotas Proyectado
            </h3>

            {!cronograma ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>
                <HelpCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <span>Simula los montos en el panel de la izquierda para desplegar el amortizado y habilitar el botón de envío directo a tu base de datos del Core.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                <div style={{ background: 'linear-gradient(135deg, #003087 0%, #0041B8 100%)', color: '#fff', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Cuota Mensual Estimada</span>
                  <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>{formatSoles(cuotaReferencial)}</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'right' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'center' }}>N°</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Vence</th>
                        <th style={{ padding: '8px' }}>Capital</th>
                        <th style={{ padding: '8px' }}>Interés</th>
                        <th style={{ padding: '8px', paddingRight: '12px' }}>Cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cronograma.map(c => (
                        <tr key={c.nro} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{c.nro}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>{c.fecha}</td>
                          <td style={{ padding: '8px' }}>{formatSoles(c.capital)}</td>
                          <td style={{ padding: '8px' }}>{formatSoles(c.interes)}</td>
                          <td style={{ padding: '8px', paddingRight: '12px', fontWeight: 'bold', color: '#003087' }}>{formatSoles(c.cuota)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={handleRegistrarSolicitud} 
                  disabled={loadingSolicitud} 
                  style={{ width: '100%', background: loadingSolicitud ? '#ffb366' : '#FF6900', color: '#fff', border: 'none', padding: '14px', borderRadius: '32px', fontSize: '0.95rem', fontWeight: 700, cursor: loadingSolicitud ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(255,105,0,.2)', marginTop: 'auto' }}
                >
                  {loadingSolicitud ? 'Inyectando fila en PostgreSQL...' : '✓ Enviar Solicitud Comercial'}
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}