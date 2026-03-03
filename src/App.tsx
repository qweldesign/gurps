import { useLocation, Outlet } from 'react-router-dom'

function App() {
  const location = useLocation()
  const headerClass = location.pathname === '/' ? 'header entrance' : 'header'

  return (
    <>
      <header className={headerClass}>
        <h1 className="sitebrand">
          <span>GURPS.AW</span>
          <span>ArtOfWarによって再構成を遂げた新しいGURPS</span>
        </h1>
      </header>
      <main className='main'>
        <Outlet />
      </main>
      <div className="cover"></div>
      <footer className="footer">
        <small>&copy; 2016 - { new Date().getFullYear() } ArtOfWar.Site</small>
      </footer>
    </>
  )
}

export default App
