
import { useContext } from 'react'
import { CarritoContext } from '../context/CarritoContext'
import './Carrito.css'

function Carrito() {

  const {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadTotal,
    precioTotal
  } = useContext(CarritoContext)

  const manejarVaciar = () => {
    const confirmar = window.confirm(
      '¿Estás seguro de que querés vaciar el carrito?'
    )

    if (confirmar) {
      vaciarCarrito()
    }
  }

  if (carrito.length === 0) {
    return (
      <section className="carrito-container">
        <h2>Mi carrito</h2>
        <p>Tu carrito está vacío.</p>
        <p>¡Agregá productos para comenzar!</p>
      </section>
    )
  }

  return (
    <section className="carrito-container">

      <h2>Mi carrito</h2>

      <div className="carrito-lista">

        {carrito.map((producto) => (
          <article className="carrito-item" key={producto.id}>

            {producto.imagen && (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="carrito-imagen"
              />
            )}

            <div className="carrito-info">

              <h3>{producto.nombre}</h3>

              <p>Precio unitario: ${producto.precio}</p>

              <p>Cantidad: {producto.cantidad}</p>

              <p>
                Subtotal: $
                {Number(producto.precio) * producto.cantidad}
              </p>

              <button
                type="button"
                onClick={() => agregarAlCarrito(producto)}
              >
                Agregar otra unidad
              </button>

              <button
                type="button"
                onClick={() => eliminarDelCarrito(producto.id)}
              >
                Eliminar producto
              </button>

            </div>

          </article>
        ))}

      </div>

      <div className="carrito-resumen">

        <h3>Resumen de compra</h3>

        <p>Productos: {cantidadTotal}</p>

        <p>Total: ${precioTotal.toLocaleString('es-AR')}</p>

        <button
          type="button"
          onClick={manejarVaciar}
        >
          Vaciar carrito
        </button>

      </div>

    </section>
  )
}

export default Carrito
