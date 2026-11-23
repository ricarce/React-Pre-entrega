
import { useState } from 'react'
import FormularioReserva from '../components/FormularioReserva'
import './Cabanas.css'

const casas = [
  {
    id: 1,
    nombre: 'Casa 1',
    precioNoche: 100000,
    imagenes: [
      '/casa1/casa1.jpg',
      '/casa1/casa1-3.jpg',
      '/casa1/casa1-4(2).jpg',
      '/casa1/casa1-5(2).jpg',
      '/casa1/casa 1-5.jpg',
      '/casa1/casa1-6 (2).jpg',
      '/casa1/casa1-6.jpg',
      '/casa1/casa1-7.jpg',
      '/casa1/casa1-8.jpg',
      '/casa1/casa1-9.jpg',
      '/casa1/casa1-10.jpg',
      '/casa1/casa1-13.jpg',
    ],
  },
  {
    id: 2,
    nombre: 'Casa 2',
    precioNoche: 100000,
    imagenes: [
      '/casa2/casa2.jpg',
      '/casa2/casa2-1.jpg',
      '/casa2/casa2-2.jpg',
      '/casa2/casa2-4.jpg',
      '/casa2/casa2-6(2).jpg',
      '/casa2/casa2-6.jpg',
      '/casa2/casa2-8.jpg',
      '/casa2/casa2-9.jpg',
      '/casa2/casa2-10.jpg',
      '/casa2/casa2-11.jpg',
    ],
  },
]

const comodidades = [
  'Capacidad para 6 personas',
  'Dos dormitorios',
  'Aire acondicionado',
  'WiFi y televisión por cable',
  'Quincho y parrilla',
  'Piscina',
]

function Galeria({ casa }) {
  const [imagenActual, setImagenActual] = useState(0)

  function anterior() {
    setImagenActual((actual) =>
      actual === 0 ? casa.imagenes.length - 1 : actual - 1
    )
  }

  function siguiente() {
    setImagenActual((actual) =>
      actual === casa.imagenes.length - 1 ? 0 : actual + 1
    )
  }

  return (
    <div className="galeria-cabana">
      <div className="galeria-imagen">
        <img
          src={casa.imagenes[imagenActual]}
          alt={`${casa.nombre} - fotografía ${imagenActual + 1}`}
          style={{
            width: '100%',
            height: '350px',
            objectFit: 'contain',
            display: 'block',
            backgroundColor: '#ddd',
          }}
        />

        <button onClick={anterior} aria-label="Fotografía anterior">
          &#10094;
        </button>

        <button onClick={siguiente} aria-label="Fotografía siguiente">
          &#10095;
        </button>
      </div>

      <p>
        Fotografía {imagenActual + 1} de {casa.imagenes.length}
      </p>
    </div>
  )
}

function Cabanas() {
  return (
    <section className="pagina-cabanas">
      <header className="cabanas-intro">
        <h1>Nuestras Cabañas</h1>
        <p>
          Descubrí Cabañas del Salado y disfrutá de una estadía
          rodeada de naturaleza y tranquilidad en General Belgrano.
        </p>
      </header>

      {casas.map((casa) => (
        <article className="casa-card" key={casa.id}>
          <h2>{casa.nombre}</h2>

          <Galeria casa={casa} />

          <h3>Comodidades</h3>

          <ul>
            {comodidades.map((comodidad) => (
              <li key={comodidad}>{comodidad}</li>
            ))}
          </ul>

          <div className="precio-cabana">
            <h3>Precio por noche</h3>
            <p>
              ${casa.precioNoche.toLocaleString('es-AR')}
            </p>
          </div>

          <FormularioReserva
            nombreCabana={casa.nombre}
            precioNoche={casa.precioNoche}
          />
        </article>
      ))}
    </section>
  )
}

export default Cabanas

