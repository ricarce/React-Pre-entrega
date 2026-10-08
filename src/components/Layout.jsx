import Header from './Header'
import NavBar from './NavBar'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <>
      <Header />
      <NavBar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  )
}

export default Layout