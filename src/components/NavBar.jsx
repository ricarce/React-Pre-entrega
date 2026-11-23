

import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import { CarritoContext } from '../context/CarritoContext'

import './NavBar.css'

function NavBar() {

  const {
    usuario,
    rol,
    cerrarSesion,
    cargandoAuth
  } = useContext(AuthContext)

  const { cantidadTotal } = useContext(CarritoContext)

  const navigate = useNavigate()

  const manejarCerrarSesion = async () => {
    try {
      await cerrarSesion()
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="site-nav">
      <div className="nav-content">

        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/cabanas">Cabañas</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
          <li><Link to="/reservas">Reservar</Link></li>

          <li>
            <Link to="/carrito">
              Carrito ({cantidadTotal})
            </Link>
          </li>

          {!cargandoAuth && (
            <>
              {!usuario ? (
                <>
                  <li><Link to="/login">Ingresar</Link></li>
                  <li><Link to="/registro">Registrarse</Link></li>
                </>
              ) : (
                <>
                  {rol === 'admin' && (
                    <li><Link to="/admin">Administración</Link></li>
                  )}

                  <li>
                    <button
                      type="button"
                      onClick={manejarCerrarSesion}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </>
              )}
            </>
          )}

        </ul>

      </div>
    </nav>
  )
}

export default NavBar
