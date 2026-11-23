
import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Registro() {

  const { registrar } = useContext(AuthContext)

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      setCargando(true)
      setError('')

      await registrar(email, password)

      navigate('/')

    } catch (error) {
      console.error('Error al registrar usuario:', error)

      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.')
      } else if (error.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.')
      } else {
        setError('No se pudo crear la cuenta. Intentá nuevamente.')
      }

    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="registro-container">

      <h2>Crear una cuenta</h2>

      <form onSubmit={manejarSubmit}>

        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmarPassword">
            Confirmar contraseña
          </label>
          <input
            id="confirmarPassword"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Crear cuenta'}
        </button>

      </form>

      <p>
        ¿Ya tenés cuenta?{' '}
        <Link to="/login">Iniciar sesión</Link>
      </p>

    </section>
  )
}

export default Registro
