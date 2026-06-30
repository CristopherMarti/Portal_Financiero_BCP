import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import NavbarPortal from '../components/NavbarPortal';

const formatSoles = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CronogramaCuotas() {
  const navigate = useNavigate();
  const { id_prestamo } = useParams(); // Captura el ID desde la URL
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCalendario = async () => {
      try {
        const token = localStorage.getItem('token');
        // Consultamos al Core el detalle del préstamo para re-calcular o traer sus cuotas
        const resDetalle = await fetch(`http://localhost:8000/api/recuperaciones/mora`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resDetalle.json();
        const prestamoActual = data.find(p => String(p.id_prestamo) === String(id_prestamo));

        if (prestamoActual) {
          // Invocamos al motor matemático de Python para estructurar las filas
          const resCronograma = await fetch('http://localhost:8000/api/solitudes/calcular-cronograma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              monto: parseFloat(prestamoActual.monto),
              plazo: parseInt(prestamoActual.plazo_meses),
              tea: 14.00 // Tasa base MYPE
            })
          });
          const dataCronograma = await resCronograma.json();
          if (dataCronograma.success) setCuotas(dataCronograma.cronograma);
        }
      } catch (err) {
        console.error("Error al estructurar calendario:", err);
      } finally {
        setLoading(false);
      }
    };
    obtenerCalendario();
  }, [id_prestamo]);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F5F5F5' }}>
      <NavbarPortal />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <button onClick={() => navigate('/dashboard/prestamos')} style={{ background: 'transparent', border: 'none', color: '#003087', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Volver a Mis Préstamos
        </button>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,.02)' }}>
          <h3 style={{ color: '#003087', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={20} /> Calendario de Pagos Real (PRE-{id_prestamo})
          </h3>

          {loading ? <p>Procesando tablas en el Core...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'center' }}>N°</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Fecha de Vencimiento</th>
                    <th style={{ padding: '12px' }}>Amortización Capital</th>
                    <th style={{ padding: '12px' }}>Interés (TEM)</th>
                    <th style={{ padding: '12px' }}>Cuota Fija</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map(c => (
                    <tr key={c.nro} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{c.nro}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{c.fecha}</td>
                      <td style={{ padding: '12px' }}>{formatSoles(c.capital)}</td>
                      <td style={{ padding: '12px' }}>{formatSoles(c.interes)}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#003087' }}>{formatSoles(c.cuota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}