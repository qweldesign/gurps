import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'
import Making from './parts/Making'
import Battle from './parts/Battle'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', Component: Entrance },
      { path: '/docs/', Component: Docs },
      { path: '/making/', Component: Making },
      { path: '/battle/', Component: Battle }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
