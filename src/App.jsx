

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'

import Home from './pages/Home'
import Productos from './pages/Productos'
import Cabanas from './pages/Cabanas'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'

import { probarConexion } from './firebase/probarConexion'

function App() {

  useEffect(() => {
    probarConexion()
  }, [])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/cabanas" element={<Cabanas />} />

          <Route path="/productos" element={<Productos />} />

          <Route path="/carrito" element={<Carrito />} />

          <Route path="/login" element={<Login />} />

          <Route path="/registro" element={<Registro />} />

          <Route
            path="/admin"
            element={
              <RutaProtegida soloAdmin>
                <Admin />
              </RutaProtegida>
            }
          />

        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
