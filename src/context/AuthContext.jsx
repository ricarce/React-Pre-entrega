
import { createContext, useEffect, useState } from 'react'

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

import { auth, db } from '../firebase/config'

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null)
  const [rol, setRol] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  // Detectar cambios en la sesión
  useEffect(() => {

    const cancelarSuscripcion = onAuthStateChanged(
      auth,
      async (usuarioFirebase) => {

        if (usuarioFirebase) {
          setUsuario(usuarioFirebase)

          try {
            const referencia = doc(db, 'usuarios', usuarioFirebase.uid)
            const documento = await getDoc(referencia)

            setRol(
              documento.exists()
                ? documento.data().rol
                : 'cliente'
            )

          } catch (error) {
            console.error('Error al consultar el rol:', error)
            setRol(null)
          }

        } else {
          setUsuario(null)
          setRol(null)
        }

        setCargandoAuth(false)
      }
    )

    return () => cancelarSuscripcion()

  }, [])

  // Registrar cliente
  const registrar = async (email, password) => {

    const resultado = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    await setDoc(doc(db, 'usuarios', resultado.user.uid), {
      email,
      rol: 'cliente',
      creado: serverTimestamp()
    })

    return resultado.user
  }

  // Iniciar sesión
  const iniciarSesion = async (email, password) => {

    const resultado = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    return resultado.user
  }

  // Cerrar sesión
  const cerrarSesion = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
        cargandoAuth,
        registrar,
        iniciarSesion,
        cerrarSesion,
        esAdmin: rol === 'admin',
        estaAutenticado: Boolean(usuario)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
