
import { useState, useEffect } from 'react'
import './FormularioReserva.css'

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'

import { db } from '../firebase/config'

// Convertir una fecha a formato YYYY-MM-DD.
function convertirFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// Obtener las noches entre dos fechas.
// El día de salida no se incluye.
function obtenerNoches(fechaIngreso, fechaEgreso) {
  const inicio = new Date(`${fechaIngreso}T00:00:00.000Z`)
  const fin = new Date(`${fechaEgreso}T00:00:00.000Z`)

  if (
    isNaN(inicio.getTime()) ||
    isNaN(fin.getTime()) ||
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

// Formatear importes en pesos argentinos.
function formatoPrecio(valor) {
  return valor.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  })
}

function FormularioReserva({ nombreCabana, precioNoche = 100000 }) {

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaIngreso: '',
    fechaEgreso: '',
    cantidadPersonas: 1
  })

  const [fechasOcupadas, setFechasOcupadas] = useState([])

  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })

  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Fecha actual.
  const hoy = convertirFecha(new Date())

  // Calcular noches y presupuesto automáticamente.
  const cantidadNoches = obtenerNoches(
    formulario.fechaIngreso,
    formulario.fechaEgreso
  ).length

  const costoTotal = cantidadNoches * precioNoche
  const anticipo = Math.round(costoTotal * 0.20)
  const saldoRestante = costoTotal - anticipo

  // Escuchar los bloqueos de esta cabaña en tiempo real.
  useEffect(() => {
    if (!nombreCabana) {
      setFechasOcupadas([])
      setCargandoDisponibilidad(false)
      return
    }

    setCargandoDisponibilidad(true)

    const consulta = query(
      collection(db, 'bloqueos'),
      where('cabana', '==', nombreCabana)
    )

    const cancelar = onSnapshot(
      consulta,
      (resultado) => {
        const fechas = resultado.docs.map(
          documento => documento.data().fecha
        )

        setFechasOcupadas(fechas)
        setCargandoDisponibilidad(false)
      },
      (error) => {
        console.error('Error al consultar disponibilidad:', error)
        setMensaje('No se pudo consultar la disponibilidad.')
        setCargandoDisponibilidad(false)
      }
    )

    return () => cancelar()
  }, [nombreCabana])

  // Actualizar campos del formulario.
  function manejarCambio(e) {
    const { name, value } = e.target

    setFormulario(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Seleccionar fechas en el calendario.
  function seleccionarFecha(fecha) {
    setMensaje('')

    if (fecha < hoy) return

    const { fechaIngreso } = formulario

    if (!fechaIngreso || fecha <= fechaIngreso) {
      if (fechasOcupadas.includes(fecha)) {
        setMensaje('Esa noche está ocupada. Elegí otra fecha de ingreso.')
        return
      }

      setFormulario(prev => ({
        ...prev,
        fechaIngreso: fecha,
        fechaEgreso: ''
      }))

      return
    }

    const noches = obtenerNoches(fechaIngreso, fecha)

    const existeConflicto = noches.some(
      noche => fechasOcupadas.includes(noche)
    )

    if (existeConflicto) {
      setMensaje(
        'Hay noches ocupadas dentro de ese período. Elegí otras fechas.'
      )
      return
    }

    setFormulario(prev => ({
      ...prev,
      fechaEgreso: fecha
    }))
  }

  // Cambiar de mes.
  function cambiarMes(direccion) {
    setMesActual(prev => new Date(
      prev.getFullYear(),
      prev.getMonth() + direccion,
      1
    ))
  }

  // Construir los días del calendario.
  const primerDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth(),
    1
  )

  const ultimoDia = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  )

  const espaciosIniciales = (primerDia.getDay() + 6) % 7

  const diasCalendario = [
    ...Array(espaciosIniciales).fill(null),
    ...Array.from(
      { length: ultimoDia.getDate() },
      (_, indice) => indice + 1
    )
  ]

  const nombreMes = mesActual.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  })

  // Comprobar si un día pertenece al rango seleccionado.
  function estaEnRango(fecha) {
    const { fechaIngreso, fechaEgreso } = formulario

    if (!fechaIngreso || !fechaEgreso) return false

    return fecha > fechaIngreso && fecha < fechaEgreso
  }

  // Enviar solicitud.
  async function manejarSubmit(e) {
    e.preventDefault()
    setMensaje('')

    if (!formulario.fechaIngreso || !formulario.fechaEgreso) {
      setMensaje('Seleccioná las fechas de ingreso y salida.')
      return
    }

    if (formulario.fechaIngreso >= formulario.fechaEgreso) {
      setMensaje('La fecha de salida debe ser posterior al ingreso.')
      return
    }

    const noches = obtenerNoches(
      formulario.fechaIngreso,
      formulario.fechaEgreso
    )

    if (noches.length === 0) {
      setMensaje('Las fechas seleccionadas no son válidas.')
      return
    }

    if (formulario.fechaIngreso < hoy) {
      setMensaje('La fecha de ingreso no puede ser anterior a hoy.')
      return
    }

    setEnviando(true)

    try {
      // Volver a consultar los bloqueos directamente en Firebase.
      const consulta = query(
        collection(db, 'bloqueos'),
        where('cabana', '==', nombreCabana)
      )

      const resultado = await getDocs(consulta)

      const bloqueosActuales = resultado.docs.map(
        documento => documento.data().fecha
      )

      const ocupado = noches.some(
        noche => bloqueosActuales.includes(noche)
      )

      if (ocupado) {
        setMensaje(
          'Lo sentimos, esas fechas ya no están disponibles. Elegí otras.'
        )
        return
      }

      // Calcular nuevamente los importes antes de guardar.
      const totalReserva = noches.length * precioNoche
      const anticipoReserva = Math.round(totalReserva * 0.20)
      const saldoReserva = totalReserva - anticipoReserva

      // Guardar la solicitud pendiente en Firebase.
      await addDoc(collection(db, 'reservas'), {
        ...formulario,

        cantidadPersonas: Number(formulario.cantidadPersonas),

        cabana: nombreCabana,

        precioNoche: precioNoche,
        cantidadNoches: noches.length,
        costoTotal: totalReserva,
        porcentajeAnticipo: 20,
        anticipo: anticipoReserva,
        saldoRestante: saldoReserva,

        estado: 'pendiente',

        fechaReserva: serverTimestamp()
      })

      setMensaje('¡Solicitud enviada correctamente! La reserva queda pendiente de confirmación.')

      setFormulario({
        nombre: '',
        email: '',
        telefono: '',
        fechaIngreso: '',
        fechaEgreso: '',
        cantidadPersonas: 1
      })

    } catch (error) {
      console.error('Error al guardar la reserva:', error)

      setMensaje(
        'No se pudo enviar la solicitud. Intentá nuevamente.'
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="formulario-reserva">

      <h3>Solicitar reserva - {nombreCabana}</h3>

      <form onSubmit={manejarSubmit}>

        <label>Nombre completo</label>

        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />

        <label>Correo electrónico</label>

        <input
          type="email"
          name="email"
          value={formulario.email}
          onChange={manejarCambio}
          required
        />

        <label>Teléfono</label>

        <input
          type="tel"
          name="telefono"
          value={formulario.telefono}
          onChange={manejarCambio}
          required
        />

        <h4>Calendario de disponibilidad</h4>

        {cargandoDisponibilidad ? (
          <p>Consultando disponibilidad...</p>
        ) : (
          <div className="calendario-reserva">

            <div className="calendario-navegacion">

              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                disabled={
                  mesActual.getFullYear() === new Date().getFullYear() &&
                  mesActual.getMonth() === new Date().getMonth()
                }
              >
                ←
              </button>

              <h4>{nombreMes}</h4>

              <button
                type="button"
                onClick={() => cambiarMes(1)}
              >
                →
              </button>

            </div>

            <div className="calendario-dias">

              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                <div key={dia} className="calendario-dia-semana">
                  {dia}
                </div>
              ))}

              {diasCalendario.map((dia, indice) => {

                if (dia === null) {
                  return (
                    <div
                      key={`vacio-${indice}`}
                      className="calendario-vacio"
                    />
                  )
                }

                const fecha = convertirFecha(
                  new Date(
                    mesActual.getFullYear(),
                    mesActual.getMonth(),
                    dia
                  )
                )

                const ocupada = fechasOcupadas.includes(fecha)
                const pasada = fecha < hoy

                const seleccionada =
                  fecha === formulario.fechaIngreso ||
                  fecha === formulario.fechaEgreso

                const enRango = estaEnRango(fecha)

                return (
                  <button
                    key={fecha}
                    type="button"
                    className={[
                      'calendario-dia',
                      ocupada ? 'ocupado' : '',
                      pasada ? 'pasado' : '',
                      seleccionada ? 'seleccionado' : '',
                      enRango ? 'en-rango' : ''
                    ].filter(Boolean).join(' ')}

                    disabled={pasada || (ocupada && !formulario.fechaIngreso)}

                    onClick={() => seleccionarFecha(fecha)}

                    title={
                      ocupada
                        ? 'Noche ocupada'
                        : 'Fecha disponible'
                    }
                  >
                    {dia}
                  </button>
                )
              })}

            </div>

            <div className="calendario-referencias">

              <span>
                <i className="referencia disponible"></i>
                Disponible
              </span>

              <span>
                <i className="referencia ocupada"></i>
                Ocupada
              </span>

              <span>
                <i className="referencia seleccionada"></i>
                Seleccionada
              </span>

            </div>

          </div>
        )}

        <label>Fecha de ingreso</label>

        <input
          type="date"
          value={formulario.fechaIngreso}
          min={hoy}
          onChange={(e) => {
            seleccionarFecha(e.target.value)
          }}
          required
        />

        <label>Fecha de salida</label>

        <input
          type="date"
          value={formulario.fechaEgreso}
          min={formulario.fechaIngreso || hoy}
          onChange={(e) => {
            const fecha = e.target.value
            if (fecha) seleccionarFecha(fecha)
          }}
          required
        />

        <label>Cantidad de personas</label>

        <input
          type="number"
          name="cantidadPersonas"
          min="1"
          max="6"
          value={formulario.cantidadPersonas}
          onChange={manejarCambio}
          required
        />

        {/* RESUMEN DEL PRESUPUESTO */}
        <div className="resumen-reserva">

          <h4>Resumen de tu estadía</h4>

          <div className="resumen-linea">
            <span>Precio por noche</span>
            <strong>{formatoPrecio(precioNoche)}</strong>
          </div>

          <div className="resumen-linea">
            <span>Cantidad de noches</span>
            <strong>{cantidadNoches}</strong>
          </div>

          <div className="resumen-linea resumen-total">
            <span>Costo total</span>
            <strong>{formatoPrecio(costoTotal)}</strong>
          </div>

          <div className="resumen-linea resumen-anticipo">
            <span>Anticipo para confirmar (20%)</span>
            <strong>{formatoPrecio(anticipo)}</strong>
          </div>

          <div className="resumen-linea">
            <span>Saldo restante (80%)</span>
            <strong>{formatoPrecio(saldoRestante)}</strong>
          </div>

          <p className="aclaracion-reserva">
            La reserva quedará pendiente hasta que la administración
            verifique el anticipo correspondiente.
          </p>

        </div>

        <button
          type="submit"
          disabled={enviando || cargandoDisponibilidad}
        >
          {enviando ? 'Enviando...' : 'Enviar solicitud'}
        </button>

        {mensaje && <p>{mensaje}</p>}

      </form>

    </div>
  )
}

export default FormularioReserva

