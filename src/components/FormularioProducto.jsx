
import "./FormularioProducto.css";

function FormularioProducto({
  formulario,
  manejarCambio,
  manejarSubmit,
  cantidadProductos,
  editando,
  cancelarEdicion,
  guardando,
}) {
  return (
    <section>
      <h2>{editando ? "Editar producto" : "Cargar producto"}</h2>

      <form onSubmit={manejarSubmit}>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />

        <label>Categoría:</label>
        <input
          type="text"
          name="categoria"
          value={formulario.categoria}
          onChange={manejarCambio}
          required
        />

        <label>Precio:</label>
        <input
          type="number"
          name="precio"
          value={formulario.precio}
          onChange={manejarCambio}
          min="1"
          required
        />

        <label>Stock:</label>
        <input
          type="number"
          name="stock"
          value={formulario.stock}
          onChange={manejarCambio}
          min="0"
          step="1"
          required
        />

        <label>URL de la imagen:</label>
        <input
          type="url"
          name="imagen"
          value={formulario.imagen}
          onChange={manejarCambio}
          placeholder="https://..."
        />

        <label>
          <input
            type="checkbox"
            name="oferta"
            checked={formulario.oferta}
            onChange={manejarCambio}
          />
          Mostrar en ofertas de Inicio
        </label>

        <button type="submit" disabled={guardando}>
          {guardando
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Cargar producto"}
        </button>

        {editando && (
          <button type="button" onClick={cancelarEdicion}>
            Cancelar edición
          </button>
        )}
      </form>

      <p>Productos cargados: {cantidadProductos}</p>
    </section>
  );
}

export default FormularioProducto;
