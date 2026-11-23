
import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function RutaProtegida({ children, soloAdmin = false }) {

  const {
    usuario,
    rol,
    cargandoAuth
  } = useContext(AuthContext)

  // Esperar a que Firebase compruebe la sesión
  if (cargandoAuth) {
    return <p>Verificando acceso...</p>
  }

  // Si no inició sesión
  if (!usuario) {
    return <Navigate to="/" replace />
  }

  // Si necesita ser administrador
  if (soloAdmin && rol !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default RutaProtegida
