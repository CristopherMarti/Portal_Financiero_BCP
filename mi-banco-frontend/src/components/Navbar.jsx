import { useNavigate } from 'react-router-dom'

const menuItems = ['Productos','Soluciones Digitales','Beneficios','Ayuda y Educación']

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <header className="navbar-bcp">
      {/* Fila superior */}
      <div className="navbar-top">
        <div className="logo">
            <img 
                src="https://logovtor.com/wp-content/uploads/2020/03/banco-de-credito-del-peru-bcp-logo-vector.png" 
                alt="Logo BCP"
                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
            />
        </div>

        <div className="tipo-cliente">
          <button className="active">Personas</button>
          <button>PyMES</button>
          <button>Empresas</button>
        </div>

        <div className="navbar-actions">
          <button className="lang-toggle">Español / Quechua</button>
          <button className="btn-abrir">⊕ Abrir cuenta</button>
          <button className="btn-banca" onClick={() => navigate('/login')}>
            🔒 Banca por Internet
          </button>
        </div>
      </div>

      {/* Menú inferior */}
      <nav className="navbar-menu">
        {menuItems.map(item => (
          <a key={item} href="#">{item} ∨</a>
        ))}
        <a href="#" style={{ marginLeft: 'auto' }}>🔍 Buscar</a>
      </nav>
    </header>
  )
}