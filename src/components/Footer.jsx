import  './Footer.css'


function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-company">
        <h2>Cabañas del Salado</h2>
        <p>Alquiler temporario en General Belgrano</p>
        <p>Un lugar para descansar y disfrutar de la naturaleza.</p>
      </div>

      <div className="footer-team">
        <h3>Nuestro equipo</h3>

        <div className="team-cards">
          <article className="team-card" >
            <img src="/equipo/avatar-ricardo.jpg" alt="Ricardo" />
            <h4>Ricardo</h4>
            <p>Administración</p>
          </article>

          <article className="team-card" >
            <h4>Soledad</h4>
            <img src=" /equipo/avatar-soledad.jpg" alt="Soledad" />
            <p>Atención al huésped</p>
          </article>

          <article className="team-card" >
            <h4>Carlos</h4>
            <img src="/equipo/avatar-carlos.jpg" alt="Carlos" />
            <p>Mantenimiento</p>
          </article>
        </div>
      </div>

      <div className="footer-copy" >
        <p>© 2026 Cabañas del Salado</p>
      </div>
    </footer>
  )
}

export default Footer