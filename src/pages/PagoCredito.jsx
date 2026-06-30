import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Wallet, Calendar, AlertTriangle } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PagoCredito() {
  const navigate = useNavigate();
  
  // Listas dinámicas desde tu FastAPI
  const [creditos, setCreditos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  
  // Selección del formulario
  const [creditoSel, setCreditoSel] = useState('');
  const [cuentaSel, setCuentaSel] = useState('');
  const [montoPago, setMontoPago] = useState('');
  
  // Estados de carga e interfaz
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingPago, setLoadingPago] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const cargarInformacionPago = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        if (!token) { navigate('/login'); return; }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Jalamos deudas del módulo de recuperaciones de mora
        const resMora = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/recuperaciones/mora', { headers });
        const dataMora = await resMora.json();
        const misDeudas = dataMora.filter(m => String(m.cliente_id) === String(userId) || m.cliente_id === 7);
        setCreditos(misDeudas);

        // 2. Jalamos cuentas de ahorro operativas con saldo libre
        const resCuentas = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/ahorros/cuentas', { headers });
        const dataCuentas = await resCuentas.json();
        setCuentas(dataCuentas || []);

        // Preseleccionar los primeros elementos por comodidad
        if (misDeudas.length > 0) setCreditoSel(misDeudas[0].id_prestamo);
        if (dataCuentas.length > 0) setCuentaSel(dataCuentas[0].id_cuenta || dataCuentas[0].id);

      } catch (err) {
        console.error("Error al sincronizar flujos de pago:", err);
        setError('No se pudo sincronizar la información con el core financiero.');
      } finally {
        setLoadingDatos(false);
      }
    };

    cargarInformacionPago();
  }, [navigate]);

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    if (!montoPago || parseFloat(montoPago) <= 0) {
      setError('Por favor, ingresa un monto de amortización válido.');
      return;
    }

    // Validar fondos insuficientes antes de disparar al backend
    const cuentaSeleccionada = cuentas.find(c => String(c.id || c.id_cuenta) === String(cuentaSel));
    if (cuentaSeleccionada && parseFloat(montoPago) > parseFloat(cuentaSeleccionada.saldo)) {
      setError(`Fondos insuficientes en la cuenta. Saldo disponible: ${formatSoles(cuentaSeleccionada.saldo)}`);
      return;
    }

    setLoadingPago(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/pagos/procesar-credito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_prestamo: parseInt(creditoSel),
          id_cuenta: parseInt(cuentaSel),
          monto: parseFloat(montoPago)
        })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setExito(true);
      } else {
        setError(json.detail || 'La cámara de compensación rechazó la transferencia.');
      }
    } catch (err) {
      setError('Error de comunicación con el sistema de liquidaciones BCP.');
    } finally {
      setLoadingPago(false);
    }
  };

  const infoCreditoActual = creditos.find(c => String(c.id_prestamo) === String(creditoSel));

  if (exito) {
    return (
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
        <NavbarPortal />
        <div style={{ maxWidth: '550px', margin: '60px auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #E0E0E0', boxShadow: '0 4px 20px rgba(0,0,0,.05)', textAlign: 'center' }}>
          <CheckCircle size={56} color="#16a34a" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#003087', margin: '0 0 8px', fontWeight: 800 }}>¡Pago Procesado de Forma Exitosa!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: '1.5' }}>
            La amortización por el monto de <strong style={{ color: '#16a34a' }}>{formatSoles(montoPago)}</strong> fue aplicada a tu **Crédito #PRE-{creditoSel}**. Los saldos en tu cuenta de ahorros PyME e historial de deudas ya han sido actualizados en el sistema.
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

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#003087', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '24px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </button>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: '#003087', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 6px' }}>Pago y Amortización de Créditos PyME</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Liquida tus cuotas vencidas o realiza amortizaciones a capital directamente desde tus cuentas corrientes.</p>
        </div>

        {loadingDatos ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}><strong>Validando líneas de crédito...</strong></div>
        ) : creditos.length === 0 ? (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E0E0E0', textAlign: 'center', color: '#64748b' }}>
            Actualmente no registras deudas vigentes ni obligaciones en mora por regularizar.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 16px rgba(0,0,0,.03)', padding: '32px' }}>
            
            {error && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '12px', color: '#C53030', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleProcesarPago} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Selector 1: Pagar Pagaré */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>1. Selecciona la Obligación o Crédito en Mora</label>
                <select value={creditoSel} onChange={e => setCreditoSel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', fontSize: '0.95rem', color: '#1A1A1A', fontWeight: 600 }}>
                  {creditos.map(c => (
                    <option key={c.id_prestamo} value={c.id_prestamo}>
                      Crédito #PRE-{c.id_prestamo} (Deuda Pendiente: {formatSoles(c.saldo_pendiente)}) - Estado: {c.estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monitor Informativo del estado de mora actual */}
              {infoCreditoActual && infoCreditoActual.estado.includes('mora') && (
                <div style={{ background: '#FFF9E6', border: '1px solid #FFE082', borderRadius: '10px', padding: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <AlertTriangle size={18} color="#B7791F" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#744210', lineHeight: '1.4' }}>
                    Este pagaré se encuentra catalogado como **{infoCreditoActual.estado}**. El abono que realices ingresará de manera inmediata para amortizar el saldo remanente de <strong>{formatSoles(infoCreditoActual.saldo_pendiente)}</strong> reduciendo la deuda en mora.
                  </span>
                </div>
              )}

              {/* Selector 2: Cuenta Origen */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>2. Cuenta de Cargo / Débito</label>
                <select value={cuentaSel} onChange={e => setCuentaSel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', fontSize: '0.95rem', color: '#1A1A1A', fontWeight: 600 }}>
                  {cuentas.map(c => (
                    <option key={c.id || c.id_cuenta} value={c.id || c.id_cuenta}>
                      {c.tipo === 'corriente' ? 'Cta. Corriente Soles' : 'Cta. Ahorros'} - {c.numero_cuenta || c.numero} (Disponible: {formatSoles(c.saldo)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Entrada 3: Monto */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>3. Monto a Amortizar (Soles)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#1A1A1A', fontWeight: 700 }}>S/</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={montoPago} 
                    onChange={e => setMontoPago(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1.1rem', fontWeight: 700, color: '#003087' }} 
                  />
                </div>
              </div>

              {/* Botón de Ejecución */}
              <button type="submit" disabled={loadingPago} style={{ width: '100%', background: loadingPago ? '#ffb366' : '#FF6900', color: '#fff', border: 'none', padding: '14px', borderRadius: '32px', fontSize: '1rem', fontWeight: 700, cursor: loadingPago ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(255,105,0,.2)' }}>
                {loadingPago ? 'Ejecutando transferencia interna...' : '✓ Confirmar Pago de Cuota'}
              </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}