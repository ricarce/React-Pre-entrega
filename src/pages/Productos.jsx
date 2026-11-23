

import { useEffect, useState, useContext } from "react";

import ItemListContainer from "../components/ItemListContainer";
import FormularioProducto from "../components/FormularioProducto";

import { AuthContext } from "../context/AuthContext";

import {
  obtenerProductos,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productosService";

const formularioInicial = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  imagen: "",
  oferta: false,
};

function Productos() {
  const { esAdmin } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Cargar productos desde Firestore.
  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Manejar cambios del formulario.
  const manejarCambio = (e) => {
    const { name, value, checked, type } = e.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guardar producto.
  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!esAdmin) return;

    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);

    if (!formulario.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (!formulario.categoria.trim()) {
      setError("La categoría es obligatoria.");
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setError("El precio debe ser mayor que cero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }

    const producto = {
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria.trim(),
      precio,
      stock,
      imagen: formulario.imagen.trim(),
      oferta: formulario.oferta,
    };

    try {
      setGuardando(true);
      setError("");

      if (productoEditando) {
        await actualizarProducto(productoEditando, producto);
      } else {
        await agregarProducto(producto);
      }

      setFormulario(formularioInicial);
      setProductoEditando(null);

      await cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError("No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  // Preparar edición.
  const manejarEditar = (producto) => {
    if (!esAdmin) return;

    setProductoEditando(producto.id);

    setFormulario({
      nombre: producto.nombre || "",
      categoria: producto.categoria || "",
      precio: String(producto.precio ?? ""),
      stock: String(producto.stock ?? ""),
      imagen: producto.imagen || "",
      oferta: producto.oferta === true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Eliminar producto.
  const manejarEliminar = async (id) => {
    if (!esAdmin) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este producto?"
    );

    if (!confirmar) return;

    try {
      setError("");
      await eliminarProducto(id);

      if (productoEditando === id) {
        cancelarEdicion();
      }

      await cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setError("No se pudo eliminar el producto.");
    }
  };

  // Cancelar edición.
  const cancelarEdicion = () => {
    setProductoEditando(null);
    setFormulario(formularioInicial);
    setError("");
  };

  return (
    <section>
      <h2>Productos Regionales y Experiencias</h2>

      {error && <p role="alert">{error}</p>}

      {esAdmin && (
        <FormularioProducto
          formulario={formulario}
          manejarCambio={manejarCambio}
          manejarSubmit={manejarSubmit}
          cantidadProductos={productos.length}
          editando={Boolean(productoEditando)}
          cancelarEdicion={cancelarEdicion}
          guardando={guardando}
        />
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <ItemListContainer productos={productos} />

          {esAdmin && (
            <>
              <h2>Administrar productos</h2>

              {productos.length === 0 ? (
                <p>Todavía no hay productos cargados.</p>
              ) : (
                <ul>
                  {productos.map((producto) => (
                    <li key={producto.id}>
                      {producto.nombre} - ${producto.precio} - Stock: {producto.stock}

                      <button
                        type="button"
                        onClick={() => manejarEditar(producto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => manejarEliminar(producto.id)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Productos;
