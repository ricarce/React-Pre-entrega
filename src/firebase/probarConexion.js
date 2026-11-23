import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";

export const probarConexion = async () => {
  try {
    const consulta = await getDocs(collection(db, "prueba"));

    consulta.forEach((documento) => {
      console.log("Documento:", documento.data());
    });

    console.log("¡Firebase conectado correctamente!");

  } catch (error) {
    console.error("Error al conectar con Firebase:", error);
  }
};