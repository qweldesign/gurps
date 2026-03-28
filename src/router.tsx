// router.tsx

import { createBrowserRouter } from 'react-router'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Entrance /> },
      { path: 'docs', children: [
        { index: true, element: <Docs /> }
      ]}
    ]
  }
])
