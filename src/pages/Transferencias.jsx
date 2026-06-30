import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CheckCircle, Wallet, Landmark } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const maskCuenta = (num) => {
  if (!num) return '•••• - •••••• - XXXX';
  const clean = num.replace(/\s+/g, '');
  return `••• - •••••• - ${clean.slice(-4)}`;
};

export default function Transferencias() {
  const navigate = useNavigate();

  // Estados del Formulario
  const [cuentas, setCuentas] = useState([]);
  const [cuentaOrigen, setCuentaOrigen] = useState('');
  const [tipoDestino, setTipoDestino] = useState('mismo_banco'); // mismo_banco o interbancario
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');

  // Estados de control de la UI
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // --- 1. CARGAR CUENTAS ORIGEN DESDE FASTAPI ---
  useEffect(() => {
    const cargarCuentasOrigen = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const response = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/ahorros/cuentas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setCuentas(data || []);
          if (data.length > 0) {
            setCuentaOrigen(data[0].id_cuenta || data[0].id);
          }
        }
      } catch (err) {
        console.error("Error al sincronizar cuentas origen:", err);
        setError('Error al sincronizar tus saldos operativos.');
      } finally {
        setLoadingDatos(false);
      }
    };

    cargarCuentasOrigen();
  }, [navigate]);

  // --- 2. DISPARAR POST REAL DE TRANSFERENCIA AL CORE ---
  const handleEjecutarTransferencia = async (e) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un importe de transferencia válido.');
      return;
    }

    // Validación local de saldos para proteger la base de datos
    const cSeleccionada = cuentas.find(c => String(c.id || c.id_cuenta) === String(cuentaOrigen));
    if (cSeleccionada && parseFloat(monto) > parseFloat(cSeleccionada.saldo)) {
      setError(`Fondos insuficientes en la cuenta origen. Disponible: ${formatSoles(cSeleccionada.saldo)}`);
      return;
    }

    setLoadingEnvio(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://portal-financiero-bcp-backend.onrender.com/api/transacciones/transferir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cuenta_origen: parseInt(cuentaOrigen),
          tipo_destino: tipoDestino,
          cuenta_destino_str: cuentaDestino,
          monto: parseFloat(monto),
          descripcion: concepto || 'Transferencia vía Banca por Internet'
        })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setExito(true);
      } else {
        setError(json.detail || 'La transferencia fue rechazada por la cámara de compensación.');
      }
    } catch (err) {
      console.error("Error de red en la transacción:", err);
      setError('Error de conexión con el servidor de liquidación inmediata.');
    } finally {
      setLoadingEnvio(false);
    }
  };

  if (exito) {
    return (
      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
        <NavbarPortal />
        <div style={{ maxWidth: '550px', margin: '60px auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #E0E0E0', boxShadow: '0 4px 20px rgba(0,0,0,.05)', textAlign: 'center' }}>
          <CheckCircle size={56} color="#16a34a" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#003087', margin: '0 0 8px', fontWeight: 800 }}>¡Transferencia Exitosa!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: '1.5' }}>
            Se han transferido de manera conforme los <strong style={{ color: '#003087' }}>{formatSoles(monto)}</strong> desde tu cuenta PyME hacia el destino indicado. El movimiento ha quedado registrado en tu historial de movimientos.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#003087', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '32px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            Volver al Dashboard
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
          <h2 style={{ color: '#003087', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 6px' }}>Transferencias Bancarias PyME</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Envía dinero de inmediato a cuentas del mismo banco o de otras entidades financieras con total seguridad.</p>
        </div>

        {loadingDatos ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}><strong>Validando tus productos financieros...</strong></div>
        ) : cuentas.length === 0 ? (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E0E0E0', textAlign: 'center', color: '#64748b' }}>
            No registras cuentas corrientes activas desde las cuales ejecutar transferencias de dinero.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 16px rgba(0,0,0,.03)', padding: '32px' }}>
            
            {error && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '12px', color: '#C53030', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleEjecutarTransferencia} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Seleccionar Cuenta de Origen */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>1. Selecciona la Cuenta de Cargo</label>
                <select value={cuentaOrigen} onChange={e => setCuentaOrigen(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', fontSize: '0.95rem', color: '#1A1A1A', fontWeight: 600 }}>
                  {cuentas.map(c => (
                    <option key={c.id || c.id_cuenta} value={c.id || c.id_cuenta}>
                      {c.tipo === 'corriente' ? 'Cta. Corriente Soles' : 'Cta. Ahorros'} - {maskCuenta(c.numero_cuenta || c.numero)} (Disponible: {formatSoles(c.saldo)})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Seleccionar Tipo de Destino */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>2. Destino de los Fondos</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>
                    <input type="radio" name="tipo_destino" checked={tipoDestino === 'mismo_banco'} onChange={() => setTipoDestino('mismo_banco')} style={{ accentColor: '#FF6900', width: '16px', height: '16px' }} />
                    Mismo Banco (BCP)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#1A1A1A' }}>
                    <input type="radio" name="tipo_destino" checked={tipoDestino === 'interbancario'} onChange={() => setTipoDestino('interbancario')} style={{ accentColor: '#FF6900', width: '16px', height: '16px' }} />
                    Interbancario (CCI)
                  </label>
                </div>
              </div>

              {/* 3. Número de Cuenta Destino */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>3. Número de Cuenta del Beneficiario</label>
                <input 
                  type="text" 
                  placeholder={tipoDestino === 'mismo_banco' ? "Ej. 191-XXXXXXXX-X-XX" : "Ej. 002-XXXXXXXXXXXXXXXXXXXX"} 
                  value={cuentaDestino} 
                  onChange={e => setCuentaDestino(e.target.value)}
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem' }} 
                />
              </div>

              {/* 4. Monto */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>4. Importe a Transferir</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#1A1A1A', fontWeight: 700 }}>S/</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={monto} 
                    onChange={e => setMonto(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1.1rem', fontWeight: 700, color: '#003087' }} 
                  />
                </div>
              </div>

              {/* 5. Concepto */}
              <div>
                <label style={{ display: 'block', color: '#003087', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>5. Concepto / Descripción</label>
                <input 
                  type="text" 
                  placeholder="Ej. Pago Proveedor / Compra Mercadería" 
                  value={concepto} 
                  onChange={e => setConcepto(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem' }} 
                />
              </div>

              {/* Botón de Envío */}
              <button type="submit" disabled={loadingEnvio} style={{ width: '100%', background: loadingEnvio ? '#ffb366' : '#FF6900', color: '#fff', border: 'none', padding: '14px', borderRadius: '32px', fontSize: '1rem', fontWeight: 700, cursor: loadingEnvio ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(255,105,0,.2)' }}>
                {loadingEnvio ? 'Procesando en Cámara de Compensación...' : '✓ Confirmar Transferencia Ejecutiva'}
              </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}