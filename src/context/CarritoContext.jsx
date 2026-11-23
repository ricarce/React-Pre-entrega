

import { createContext, useState, useEffect } from 'react'

export const CarritoContext = createContext()

function obtenerCarritoGuardado() {
  try {
    const carritoGuardado = localStorage.getItem('carrito-cabanas-del-salado')

    return carritoGuardado ? JSON.parse(carritoGuardado) : []
  } catch (error) {
    console.error('Error al recuperar el carrito:', error)
    return []
  }
}

export function CarritoProvider({ children }) {

  const [carrito, setCarrito] = useState(obtenerCarritoGuardado)

  // Guardar el carrito cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(
        'carrito-cabanas-del-salado',
        JSON.stringify(carrito)
      )
    } catch (error) {
      console.error('Error al guardar el carrito:', error)
    }
  }, [carrito])

  // Agregar productos
  const agregarAlCarrito = (producto) => {
    setCarrito((carritoAnterior) => {
      const existe = carritoAnterior.find(
        (item) => item.id === producto.id
      )

      if (existe) {
        return carritoAnterior.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }

      return [...carritoAnterior, { ...producto, cantidad: 1 }]
    })
  }

  // Eliminar un producto
  const eliminarDelCarrito = (id) => {
    setCarrito((carritoAnterior) =>
      carritoAnterior.filter((item) => item.id !== id)
    )
  }

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([])
  }

  // Calcular cantidad total
  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  )

  // Calcular precio total
  const precioTotal = carrito.reduce(
    (total, item) => total + Number(item.precio) * item.cantidad,
    0
  )

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        cantidadTotal,
        precioTotal
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}
