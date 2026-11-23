
import { useState, useEffect } from 'react'

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'

import {
  collection,
  onSnapshot,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore'

import { auth, db } from '../firebase/config'

// Obtener cada noche que ocupa una reserva.
// El día de salida no se bloquea.
function obtenerNoches(fechaIngreso, fechaEgreso) {

  if (
    typeof fechaIngreso !== 'string' ||
    typeof fechaEgreso !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaIngreso) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaEgreso)
  ) {
    return []
  }

  const inicio = new Date(`${fechaIngreso}T00:00:00.000Z`)
  const fin = new Date(`${fechaEgreso}T00:00:00.000Z`)

  if (
    isNaN(inicio.getTime()) ||
    isNaN(fin.getTime()) ||
    inicio.toISOString().slice(0, 10) !== fechaIngreso ||
    fin.toISOString().slice(0, 10) !== fechaEgreso ||
    inicio >= fin
  ) {
    return []
  }

  const noches = []
  const fecha = new Date(inicio)

  while (fecha < fin) {
    noches.push(fecha.toISOString().slice(0, 10))
    fecha.setUTCDate(fecha.getUTCDate() + 1)
  }

  return noches
}

// Identificador único para cada cabaña y noche.
function obtenerIdBloqueo(cabana, fecha) {
  return `${encodeURIComponent(cabana)}_${fecha}`
}

function Admin() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usuario, setUsuario] = useState(null)

  const [reservas, setReservas] = useState([])
  const [filtro, setFiltro] = useState('todas')

  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [cargandoReservas, setCargandoReservas] = useState(false)
  const [procesandoId, setProcesandoId] = useState(null)

  // Controlar la sesión del administrador.
  useEffect(() => {

    const cancelar = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual)
      setCargando(false)
    })

    return () => cancelar()

  }, [])

  // Escuchar cambios en Firestore.
  useEffect(() => {

    if (!usuario) {
      setReservas([])
      setCargandoReservas(false)
      return
    }

    setCargandoReservas(true)

    const cancelar = onSnapshot(
      collection(db, 'reservas'),

      (resultado) => {

        const lista = resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data()
        }))

        setReservas(lista)
        setCargandoReservas(false)
      },

      (error) => {
        console.error('Error al consultar reservas:', error)
        setMensaje('No se pudieron cargar las reservas.')
        setCargandoReservas(false)
      }
    )

    return () => cancelar()

  }, [usuario])

  // Iniciar sesión.
  async function manejarLogin(e) {

    e.preventDefault()
    setMensaje('')

    try {

      await signInWithEmailAndPassword(auth, email, password)

    } catch (error) {

      console.error('Error de autenticación:', error)
      setMensaje('Correo o contraseña incorrectos.')

    }
  }

  // Cerrar sesión.
  async function manejarLogout() {

    try {

      await signOut(auth)
      setMensaje('')

    } catch (error) {

      console.error('Error al cerrar sesión:', error)
      setMensaje('No se pudo cerrar la sesión.')

    }
  }

  // Confirmar o cancelar una reserva.
  async function manejarEstadoReserva(reserva, nuevoEstado) {

    if (procesandoId !== null) return

    setMensaje('')
    setProcesandoId(reserva.id)

    const reservaRef = doc(db, 'reservas', reserva.id)

    try {

      // Comprobar que la operación solicitada sea válida.
      if (
        nuevoEstado !== 'confirmada' &&
        nuevoEstado !== 'cancelada'
      ) {
        throw new Error('La operación solicitada no es válida.')
      }

      // Confirmar que la reserva existe y tiene datos correctos.
      if (!reserva.cabana) {
        throw new Error('La reserva no tiene una cabaña asignada.')
      }

      // Para confirmar, también comprobamos reservas confirmadas
      // que pudieran existir antes de implementar los bloqueos.
      if (nuevoEstado === 'confirmada') {

        const consultaReservas = await getDocs(
          collection(db, 'reservas')
        )

        const nochesSolicitadas = obtenerNoches(
          reserva.fechaIngreso,
          reserva.fechaEgreso
        )

        if (nochesSolicitadas.length === 0) {
          throw new Error('Las fechas de la reserva no son válidas.')
        }

        const existeConflictoAnterior = consultaReservas.docs.some(
          (documento) => {

            if (documento.id === reserva.id) return false

            const otraReserva = documento.data()

            if (
              otraReserva.estado !== 'confirmada' ||
              otraReserva.cabana !== reserva.cabana
            ) {
              return false
            }

            return (
              otraReserva.fechaIngreso < reserva.fechaEgreso &&
              otraReserva.fechaEgreso > reserva.fechaIngreso
            )
          }
        )

        if (existeConflictoAnterior) {
          throw new Error(
            'No se puede confirmar: ya existe otra reserva confirmada para esas fechas.'
          )
        }
      }

      // Ejecutar la operación de forma atómica.
      await runTransaction(db, async (transaccion) => {

        // PRIMERA LECTURA: reserva.
        const reservaActual = await transaccion.get(reservaRef)

        if (!reservaActual.exists()) {
          throw new Error('La reserva ya no existe.')
        }

        const datos = reservaActual.data()

        // CONFIRMAR RESERVA.
        if (nuevoEstado === 'confirmada') {

          if (datos.estado !== 'pendiente') {
            throw new Error('Esta solicitud ya no está pendiente.')
          }

          if (!datos.cabana) {
            throw new Error('La reserva no tiene una cabaña asignada.')
          }

          const noches = obtenerNoches(
            datos.fechaIngreso,
            datos.fechaEgreso
          )

          if (noches.length === 0) {
            throw new Error('Las fechas de la reserva no son válidas.')
          }

          // Crear las referencias de todos los bloqueos.
          const referenciasBloqueos = noches.map((fecha) =>
            doc(
              db,
              'bloqueos',
              obtenerIdBloqueo(datos.cabana, fecha)
            )
          )

          // LEER TODOS LOS BLOQUEOS ANTES DE ESCRIBIR.
          const bloqueos = await Promise.all(
            referenciasBloqueos.map((referencia) =>
              transaccion.get(referencia)
            )
          )

          // Comprobar que ninguna noche esté ocupada.
          const ocupado = bloqueos.some((bloqueo) => {

            return (
              bloqueo.exists() &&
              bloqueo.data().reservaId !== reserva.id
            )

          })

          if (ocupado) {
            throw new Error(
              'Alguna de las noches seleccionadas ya está ocupada.'
            )
          }

          // Crear un bloqueo por cada noche.
          referenciasBloqueos.forEach((referencia, indice) => {

            transaccion.set(referencia, {
              reservaId: reserva.id,
              cabana: datos.cabana,
              fecha: noches[indice],
              fechaBloqueo: serverTimestamp()
            })

          })

          // Actualizar el estado de la reserva.
          transaccion.update(reservaRef, {
            estado: 'confirmada'
          })

        }

        // CANCELAR O RECHAZAR RESERVA.
        else if (nuevoEstado === 'cancelada') {

          if (
            datos.estado !== 'pendiente' &&
            datos.estado !== 'confirmada'
          ) {
            throw new Error('Esta reserva ya fue cancelada.')
          }

          // Si estaba confirmada, liberar sus noches.
          if (datos.estado === 'confirmada') {

            const noches = obtenerNoches(
              datos.fechaIngreso,
              datos.fechaEgreso
            )

            if (noches.length === 0) {
              throw new Error('Las fechas de la reserva no son válidas.')
            }

            const referenciasBloqueos = noches.map((fecha) =>
              doc(
                db,
                'bloqueos',
                obtenerIdBloqueo(datos.cabana, fecha)
              )
            )

            // Leer todos los bloqueos antes de eliminarlos.
            const bloqueos = await Promise.all(
              referenciasBloqueos.map((referencia) =>
                transaccion.get(referencia)
              )
            )

            // Eliminar únicamente los bloqueos de esta reserva.
            referenciasBloqueos.forEach((referencia, indice) => {

              if (
                bloqueos[indice].exists() &&
                bloqueos[indice].data().reservaId === reserva.id
              ) {
                transaccion.delete(referencia)
              }

            })
          }

          // Actualizar el estado.
          transaccion.update(reservaRef, {
            estado: 'cancelada'
          })

        }

      })

      if (nuevoEstado === 'confirmada') {

        setMensaje('¡Reserva confirmada correctamente!')

      } else {

        setMensaje('La reserva fue cancelada correctamente.')

      }

    } catch (error) {

      console.error('Error al gestionar la reserva:', error)

      setMensaje(
        error.message || 'No se pudo modificar la reserva.'
      )

    } finally {

      setProcesandoId(null)

    }
  }

  // Contadores.
  const pendientes = reservas.filter(
    reserva => reserva.estado === 'pendiente'
  ).length

  const confirmadas = reservas.filter(
    reserva => reserva.estado === 'confirmada'
  ).length

  const canceladas = reservas.filter(
    reserva => reserva.estado === 'cancelada'
  ).length

  // Filtros.
  const reservasFiltradas = reservas.filter(reserva => {

    if (filtro === 'todas') return true

    return reserva.estado === filtro

  })

  if (cargando) {
    return <p>Comprobando sesión...</p>
  }

  return (

    <section className="admin-container">

      {!usuario ? (

        <form onSubmit={manejarLogin}>

          <h1>Administración</h1>
          <h2>Iniciar sesión</h2>

          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Ingresar
          </button>

          {mensaje && <p>{mensaje}</p>}

        </form>

      ) : (

        <div className="panel-admin">

          <header className="admin-header">

            <div>
              <h1>Panel de administración</h1>
              <p>Bienvenido: {usuario.email}</p>
            </div>

            <button onClick={manejarLogout}>
              Cerrar sesión
            </button>

          </header>

          <h2>Resumen de reservas</h2>

          <div className="admin-resumen">

            <div className="admin-card">
              <h3>Pendientes</h3>
              <p>{pendientes}</p>
            </div>

            <div className="admin-card">
              <h3>Confirmadas</h3>
              <p>{confirmadas}</p>
            </div>

            <div className="admin-card">
              <h3>Canceladas</h3>
              <p>{canceladas}</p>
            </div>

          </div>

          <h2>Solicitudes de reserva</h2>

          <label>Filtrar reservas</label>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          {cargandoReservas ? (

            <p>Cargando reservas...</p>

          ) : reservasFiltradas.length === 0 ? (

            <p>No hay reservas para mostrar.</p>

          ) : (

            <div className="admin-lista">

              {reservasFiltradas.map(reserva => (

                <article
                  className="admin-reserva"
                  key={reserva.id}
                >

                  <h3>{reserva.nombre}</h3>

                  <p>
                    <strong>Cabaña:</strong> {reserva.cabana}
                  </p>

                  <p>
                    <strong>Email:</strong> {reserva.email}
                  </p>

                  <p>
                    <strong>Teléfono:</strong> {reserva.telefono}
                  </p>

                  <p>
                    <strong>Ingreso:</strong> {reserva.fechaIngreso}
                  </p>

                  <p>
                    <strong>Salida:</strong> {reserva.fechaEgreso}
                  </p>

                  <p>
                    <strong>Personas:</strong> {reserva.cantidadPersonas}
                  </p>

                  <p>
                    <strong>Estado:</strong> {reserva.estado}
                  </p>

                  {reserva.estado === 'pendiente' && (

                    <div className="admin-acciones">

                      <button
                        onClick={() =>
                          manejarEstadoReserva(reserva, 'confirmada')
                        }
                        disabled={procesandoId !== null}
                      >
                        {procesandoId === reserva.id
                          ? 'Procesando...'
                          : 'Confirmar'}
                      </button>

                      <button
                        onClick={() =>
                          manejarEstadoReserva(reserva, 'cancelada')
                        }
                        disabled={procesandoId !== null}
                      >
                        {procesandoId === reserva.id
                          ? 'Procesando...'
                          : 'Rechazar'}
                      </button>

                    </div>

                  )}

                  {reserva.estado === 'confirmada' && (

                    <button
                      onClick={() =>
                        manejarEstadoReserva(reserva, 'cancelada')
                      }
                      disabled={procesandoId !== null}
                    >
                      {procesandoId === reserva.id
                        ? 'Procesando...'
                        : 'Cancelar reserva'}
                    </button>

                  )}

                </article>

              ))}

            </div>

          )}

          {mensaje && <p>{mensaje}</p>}

        </div>

      )}

    </section>
  )
}

export default Admin
