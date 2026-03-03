import { useState } from 'react'
import { useLocation, Link, Outlet } from 'react-router-dom'

function App() {
  const location = useLocation()
  const headerClass = location.pathname === '/' ? 'header entrance' : 'header'
  const [coverClass] = useState(() => {
    const random = Math.floor(Math.random() * 2)
    return random === 0
      ? 'cover is-image-1'
      : 'cover is-image-2'
  })

  return (
    <>
      <header className={headerClass}>
        <h1 className="sitebrand">
          <Link to="/">
            <span className='sitebrand__title'>GURPS.AW</span>
            <span className='sitebrand__tagline'>ArtOfWarによって再構成を遂げた新しいGURPS</span>
          </Link>
        </h1>
      </header>
      <main className='main'>
        <Outlet />
      </main>
      <div className={coverClass}></div>
      <footer className="footer">
        <small>&copy; 2016 - { new Date().getFullYear() } ArtOfWar.Site</small>
      </footer>
    </>
  )
}

export default App
