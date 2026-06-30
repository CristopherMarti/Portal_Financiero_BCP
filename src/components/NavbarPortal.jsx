import { useNavigate } from 'react-router-dom';

export default function NavbarPortal() {
  const navigate = useNavigate();
  const nombreCliente = localStorage.getItem('nombre') || 'Cliente';

  const handleLogout = () => {
    localStorage.clear(); // Limpia token, id y nombre de forma segura
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #E0E0E0',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 32px',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        <span>
          <img
            src="https://logovtor.com/wp-content/uploads/2020/03/banco-de-credito-del-peru-bcp-logo-vector.png"
            alt="BCP Homebanking"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#FF6900', fontWeight: 600, fontSize: '.9rem' }}>
            👤 {nombreCliente}
          </span>
          <button
            onClick={handleLogout}
            style={{
              border: '1.5px solid #003087',
              color: '#003087',
              background: 'transparent',
              padding: '6px 16px',
              borderRadius: 20,
              fontWeight: 600,
              fontSize: '.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}