import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // --- ESTADOS DE LAS TRES CELDAS REALES BCP ---
  const [tarjeta, setTarjeta] = useState('');
  const [dni, setDni] = useState('');
  const [clave, setClave] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Apuntamos al puerto 8001 donde corre tu Uvicorn
      const res = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos las llaves exactas que exige tu LoginSchema de Pydantic
        body: JSON.stringify({ 
          username: tarjeta, // Captura 'cli000007'
          dni: dni,          // Captura '12345677'
          password: clave    // Captura la contraseña
        })
      });

      const json = await res.json();

      // Si el backend lanza el HTTP 401 o el 422 de Pydantic
      if (!res.ok) {
        setError(json.detail || 'Usuario, DNI o contraseña incorrectos.');
        setLoading(false);
        return;
      }

      // Almacenamos los datos devueltos por tu resultado en Python
      // Ajusta las llaves si tu backend devuelve nombres distintos (ej. json.access_token)
      localStorage.setItem('token', json.access_token || json.data?.access_token);
      localStorage.setItem('user_id', json.user_id || json.data?.user_id || json.id);
      localStorage.setItem('nombre', json.nombre || json.data?.nombre || 'Cliente');

      navigate('/dashboard');

    } catch (err) {
      setError('Error de conexión con el Core del Banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── PANEL IZQUIERDO AZUL BCP ── */}
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
            style={{ height: '45px', width: 'auto', objectFit: 'contain' }}
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

        {/* Icono central de banco */}
        <div style={{
          width: 240, height: 240,
          background: 'rgba(255,255,255,.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5.5rem',
          zIndex: 2
        }}>
          🏦
        </div>

        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.85rem', textAlign: 'center', marginTop: 20, zIndex: 2 }}>
          Banca digital segura y confiable
        </p>
      </div>

      {/* ── PANEL DERECHO FORMULARIO BCP ── */}
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

        {/* Timer superior */}
        <div style={{ position: 'absolute', top: 20, right: 28, fontSize: '.8rem', color: '#888' }}>
          Esta ventana se cerrará en <strong style={{ color: '#003087' }}>250</strong> segundos ⏱
        </div>

        {/* Título de sección */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003087', margin: '0 0 4px' }}>Banca por Internet</h2>
          <p style={{ color: '#888', fontSize: '.85rem', margin: 0 }}>Ingresa con el número de tu tarjeta de ahorros</p>
        </div>

        {/* Contenedor Card Principal */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '32px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,48,135,.06)',
          border: '1px solid #e8eef5'
        }}>

          {/* Selector Persona / Empresa */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, justifyContent: 'center' }}>
            {['Persona', 'Empresa'].map((op, i) => (
              <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.9rem', fontWeight: 600, color: persona === (i === 0) ? '#003087' : '#64748b' }}>
                <input 
                  type="radio" 
                  name="tipo"
                  checked={persona === (i === 0)}
                  onChange={() => setPersona(i === 0)}
                  style={{ accentColor: '#FF6900', width: 16, height: 16 }} 
                />
                {op}
              </label>
            ))}
          </div>

          {/* Mensaje de Error Idéntico al BCP */}
          {error && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FEB2B2',
              borderRadius: 8, padding: '12px', color: '#C53030',
              fontSize: '.85rem', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* CELDA 1: Número de tarjeta */}
            <div style={{ border: '1.5px solid #ddd', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#fff' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: '.7rem', color: '#003087', fontWeight: 700 }}>
                N° de tarjeta de ahorros
              </label>
              <span style={{ position: 'absolute', left: 14, bottom: 10, fontSize: '1rem' }}>💳</span>
              <input
                type="text"
                placeholder="cli000007"
                value={tarjeta}
                onChange={e => setTarjeta(e.target.value)}
                required
                style={{ width: '100%', border: 'none', outline: 'none', padding: '24px 14px 8px 40px', fontSize: '.95rem', background: 'transparent' }}
              />
            </div>

            {/* CELDA 2: DNI */}
            <div style={{ border: '1.5px solid #ddd', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#fff' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: '.7rem', color: '#003087', fontWeight: 700 }}>
                DNI
              </label>
              <span style={{ position: 'absolute', left: 14, bottom: 10, fontSize: '1rem' }}>🪪</span>
              <input
                type="text"
                placeholder="11200007"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                maxLength={8}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '24px 14px 8px 40px', fontSize: '.95rem', background: 'transparent' }}
              />
            </div>

            {/* CELDA 3: Clave de Internet */}
            <div style={{ border: '1.5px solid #ddd', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#fff' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: '.7rem', color: '#003087', fontWeight: 700 }}>
                Clave de Internet
              </label>
              <span style={{ position: 'absolute', left: 14, bottom: 10, fontSize: '1rem' }}>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={clave}
                onChange={e => setClave(e.target.value)}
                required
                style={{ width: '100%', border: 'none', outline: 'none', padding: '24px 14px 8px 40px', fontSize: '.95rem', background: 'transparent', letterSpacing: '2px' }}
              />
            </div>

            {/* Botón Naranja BCP */}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#ffb366' : '#FF6900',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 32,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
              boxShadow: '0 4px 12px rgba(255,105,0,.2)'
            }}>
              {loading ? 'Verificando en Core...' : '→ Ingresar'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}