import { useState } from "react";
import FormularioProducto from "./FormularioProducto";

function FormularioContainer() {

  const [formulario, setFormulario] = useState({
    id: "",
    nombre: "",
    precio: "",
    stock: "",
    imagen: null,
  });

  const [productos, setProductos] = useState([]);

  const manejarCambio = (e) => {
    const { name, value, files } = e.target;

    setFormulario({
      ...formulario,
      [name]: files ? files[0] : value,
    });
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    alert("Producto recibido");

    setProductos([...productos, formulario]);

    console.log(formulario);
  };

  return (
    <FormularioProducto
      formulario={formulario}
      manejarCambio={manejarCambio}
      manejarSubmit={manejarSubmit}
      cantidadProductos={productos.length}
    />
  );
}

export default FormularioContainer;