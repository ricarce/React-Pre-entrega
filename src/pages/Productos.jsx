import { useEffect, useState } from "react";
import ItemListContainer from "../components/ItemListContainer";
import FormularioProducto from "../components/FormularioProducto";

function Productos() {
  const [productos, setProductos] = useState([]);

  const [formulario, setFormulario] = useState({
    id: "",
    nombre: "",
    precio: "",
    stock: "",
    imagen: null,
  });

  useEffect(() => {
    fetch("/productos.json")
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setProductos(datos);
      });
  }, []);

  const manejarCambio = (e) => {
    const { name, value, files } = e.target;

    setFormulario({
      ...formulario,
      [name]: files ? files[0] : value,
    });
  };

  const subirImagen = async (imagen) => {
    const datos = new FormData();

    datos.append("image", imagen);

    const respuesta = await fetch(
      "https://api.imgbb.com/1/upload?key= 1de63e6eca5b4219d22c2209005f569d",
      {
        method: "POST",
        body: datos,
      }
    );

    const resultado = await respuesta.json();

    return resultado.data.url;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    let urlImagen = "";

    if (formulario.imagen) {
      urlImagen = await subirImagen(formulario.imagen);
    }

    const nuevoProducto = {
      id: formulario.id,
      nombre: formulario.nombre,
      precio: formulario.precio,
      stock: formulario.stock,
      imagen: urlImagen,
    };

    setProductos((productosActuales) => {
      const existe = productosActuales.some(
        (producto) => String(producto.id) === String(nuevoProducto.id)
      );

      if (existe) {
        return productosActuales.map((producto) =>
          String(producto.id) === String(nuevoProducto.id)
            ? nuevoProducto
            : producto
        );
      }

      return [...productosActuales, nuevoProducto];
    });

    setFormulario({
      id: "",
      nombre: "",
      precio: "",
      stock: "",
      imagen: null,
    });
  };

  return (
    <section>
      <h2>Productos Regionales y Experiencias</h2>

      <ItemListContainer productos={productos} />

      <FormularioProducto
        formulario={formulario}
        manejarCambio={manejarCambio}
        manejarSubmit={manejarSubmit}
        cantidadProductos={productos.length}
      />
    </section>
  );
}

export default Productos;