
import { Link } from 'react-router-dom'
import './Home.css'

const comodidades = [
  {
    icono: '🏊',
    titulo: 'Piscina',
    descripcion: 'Disfrutá y relajate durante los días de verano.',
  },
  {
    icono: '🔥',
    titulo: 'Quincho y parrilla',
    descripcion: 'Compartí buenos momentos al aire libre.',
  },
  {
    icono: '🌳',
    titulo: 'Naturaleza',
    descripcion: 'Un entorno ideal para descansar y desconectar.',
  },
  {
    icono: '📶',
    titulo: 'WiFi y comodidad',
    descripcion: 'Todo lo necesario para sentirte como en casa.',
  },
]

function Home() {
  return (
    <div className="home">

      {/* PORTADA PRINCIPAL */}
      <section className="home-hero">
        <div className="home-hero-contenido">
          <span className="home-etiqueta">
            GENERAL BELGRANO · BUENOS AIRES
          </span>

          <h1>
            Tu lugar para
            <span> desconectar</span>
          </h1>

          <p>
            Naturaleza, tranquilidad y comodidad.
            Viví una experiencia de descanso en Cabañas del Salado.
          </p>

          <div className="home-botones">
            <Link to="/cabanas" className="home-btn home-btn-principal">
              Conocé nuestras cabañas
            </Link>

            <Link to="/reservas" className="home-btn home-btn-secundario">
              Consultar disponibilidad
            </Link>
          </div>
        </div>
      </section>

      {/* PRESENTACIÓN */}
      <section className="home-presentacion">
        <span className="home-subtitulo">BIENVENIDOS</span>

        <h2>Un descanso que vale la pena</h2>

        <p>
          En Cabañas del Salado te esperamos para disfrutar de unos días
          diferentes, rodeados de naturaleza y tranquilidad.
          Un espacio pensado para compartir en familia, descansar
          y disfrutar de cada momento.
        </p>
      </section>

      {/* COMODIDADES */}
      <section className="home-comodidades">
        <div className="home-seccion-titulo">
          <span className="home-subtitulo">TU ESTADÍA</span>
          <h2>Todo preparado para disfrutar</h2>
          <p>
            Comodidades para que solamente tengas que preocuparte
            por descansar.
          </p>
        </div>

        <div className="home-comodidades-grid">
          {comodidades.map((item) => (
            <article className="home-comodidad-card" key={item.titulo}>
              <span className="home-comodidad-icono">
                {item.icono}
              </span>

              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      {/* NUESTRAS CABAÑAS */}
      <section className="home-cabanas">
        <div className="home-seccion-titulo">
          <span className="home-subtitulo">ALOJAMIENTO</span>
          <h2>Conocé nuestras cabañas</h2>
          <p>
            Espacios cómodos y equipados para disfrutar
            de una estadía inolvidable.
          </p>
        </div>

        <div className="home-cabanas-grid">

          <article className="home-cabana-card">
            <img
              src="/casa1/casa1.jpg"
              alt="Exterior de Casa 1"
            />

            <div className="home-cabana-info">
              <h3>Casa 1</h3>
              <p>Comodidad y tranquilidad para disfrutar en familia.</p>
              <span>Hasta 6 personas</span>
            </div>
          </article>

          <article className="home-cabana-card">
            <img
              src="/casa2/casa2.jpg"
              alt="Exterior de Casa 2"
            />

            <div className="home-cabana-info">
              <h3>Casa 2</h3>
              <p>Un espacio ideal para compartir y descansar.</p>
              <span>Hasta 6 personas</span>
            </div>
          </article>

        </div>

        <Link to="/cabanas" className="home-btn home-btn-vermas">
          Ver cabañas y fotografías
        </Link>
      </section>

      {/* INVITACIÓN FINAL */}
      <section className="home-reserva">
        <h2>Tu próxima escapada comienza acá</h2>

        <p>
          Consultá disponibilidad y preparate para disfrutar
          de unos días de descanso en General Belgrano.
        </p>

        <Link to="/reservas" className="home-btn home-btn-reserva">
          Quiero reservar
        </Link>
      </section>

    </div>
  )
}

export default Home
