import Item from "./Item";
import "./ItemListContainer.css";

function ItemListContainer({ productos }) {
  return (
    <section className="productos-section">
      <h2>Nuestros productos</h2>

      <div className="items-grid">
        {productos.map((producto) => (
          <Item
            key={producto.id}
            producto={producto}
          />
        ))}
      </div>
    </section>
  );
}

export default ItemListContainer;