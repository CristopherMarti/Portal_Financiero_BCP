import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home     from './pages/Home'
import Login    from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import './styles/global.css'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/registro"  element={<Registro />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}