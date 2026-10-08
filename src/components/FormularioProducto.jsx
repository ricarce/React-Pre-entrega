import "./FormularioProducto.css";

function FormularioProducto({
  formulario,
  manejarCambio,
  manejarSubmit,
  cantidadProductos,
}) {
  return (
    <section>
      <h2>Cargar producto</h2>

      <form onSubmit={manejarSubmit}>
        <label>ID:</label>
        <input
          type="number"
          name="id"
          value={formulario.id}
          onChange={manejarCambio}
        />

        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
        />

        <label>Precio:</label>
        <input
          type="number"
          name="precio"
          value={formulario.precio}
          onChange={manejarCambio}
        />

        <label>Stock:</label>
        <input
          type="number"
          name="stock"
          value={formulario.stock}
          onChange={manejarCambio}
        />

        <label>Imagen:</label>

        <label htmlFor="imagen" className="boton-imagen">
          Seleccionar imagen
        </label>

        <input
          id="imagen"
          type="file"
          accept="image/*"
          name="imagen"
          onChange={manejarCambio}
          className="input-imagen"
        />

        {formulario.imagen && (
          <p>Imagen seleccionada: {formulario.imagen.name}</p>
        )}

        <button type="submit">Cargar producto</button>
      </form>

      <p>Productos cargados: {cantidadProductos}</p>
    </section>
  );
}

export default FormularioProducto;