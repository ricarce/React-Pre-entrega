
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/config";

const productosRef = collection(db, "productos");

// READ
export async function obtenerProductos() {
  const resultado = await getDocs(productosRef);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

// CREATE
export async function agregarProducto(producto) {
  const nuevoProducto = {
    ...producto,
    creadoEn: serverTimestamp()
  };

  const resultado = await addDoc(productosRef, nuevoProducto);

  return resultado.id;
}

// UPDATE
export async function actualizarProducto(id, producto) {
  const productoRef = doc(db, "productos", id);

  await updateDoc(productoRef, producto);
}

// DELETE
export async function eliminarProducto(id) {
  const productoRef = doc(db, "productos", id);

  await deleteDoc(productoRef);
}

