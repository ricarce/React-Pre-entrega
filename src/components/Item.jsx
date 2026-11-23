
import { useContext } from 'react'
import { CarritoContext } from '../context/CarritoContext'
import './Item.css'

function Item({ producto }) {

  const { agregarAlCarrito } = useContext(CarritoContext)

  const manejarAgregar = () => {
    agregarAlCarrito(producto)
    alert(`${producto.nombre} se agregó al carrito`)
  }

  return (
    <article className="item-card">

      {producto.imagen && (
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="item-imagen"
        />
      )}

      <h3>{producto.nombre}</h3>

      <p>Categoria: {producto.categoria}</p>

      <p>Precio: ${producto.precio}</p>

      <button
        type="button"
        className="btn-agregar-carrito"
        onClick={manejarAgregar}
      >
        Agregar al carrito
      </button>

    </article>
  )
}

export default Item
