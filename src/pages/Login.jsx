
import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const correoGuardado = localStorage.getItem('ultimoCorreo') || ''

function Login() {

  const { iniciarSesion } = useContext(AuthContext)

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordarCorreo, setRecordarCorreo] = useState(false)
  const [mostrarUltimoCorreo, setMostrarUltimoCorreo] = useState(
    Boolean(correoGuardado)
  )

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Utilizar el último correo
  const usarUltimoCorreo = () => {
    setEmail(correoGuardado)
    setRecordarCorreo(true)
    setMostrarUltimoCorreo(false)
  }

  // Iniciar sesión
  const manejarSubmit = async (e) => {
    e.preventDefault()

    try {
      setCargando(true)
      setError('')

      await iniciarSesion(email, password)

      if (recordarCorreo) {
        localStorage.setItem('ultimoCorreo', email.trim())
      } else {
        localStorage.removeItem('ultimoCorreo')
      }

      navigate('/')

    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError('Correo electrónico o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="login-container">

      <h2>Iniciar sesión</h2>

      {mostrarUltimoCorreo && (
        <div className="ultimo-correo">

          <p>
            ¿Querés utilizar el último correo que usaste?
          </p>

          <p>{correoGuardado}</p>

          <button
            type="button"
            onClick={usarUltimoCorreo}
          >
            Sí, utilizarlo
          </button>

          <button
            type="button"
            onClick={() => setMostrarUltimoCorreo(false)}
          >
            No, ingresar otro
          </button>

        </div>
      )}

      <form onSubmit={manejarSubmit}>

        <div>
          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={recordarCorreo}
            onChange={(e) => setRecordarCorreo(e.target.checked)}
          />

          Recordar mi correo electrónico
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

      </form>

      <p>
        ¿Todavía no tenés cuenta?{' '}
        <Link to="/registro">Registrate aquí</Link>
      </p>

    </section>
  )
}

export default Login
