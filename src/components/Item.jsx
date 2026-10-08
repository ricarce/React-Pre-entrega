import './Item.css'

function Item({ producto }) {
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

    </article>
  )
}

export default Item