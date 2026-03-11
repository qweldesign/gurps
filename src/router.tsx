// router.tsx

import { createBrowserRouter } from 'react-router'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'
import Sample from './parts/Sample'
import Edit from './parts/Edit'
import View from './parts/Edit/View'
import Making from './parts/Edit/Making'
import Battle from './parts/Battle'
import { docsLoader } from './loader/docsLoader'
import { idLoader } from './loader/idLoader'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Entrance /> },
      { path: 'docs', children: [
        { index: true, element: <Docs />, loader: docsLoader },
        { path: ':docsId', element: <Docs />, loader: docsLoader }
      ]},
      { path: 'sample', children: [
        { index: true, element: <Sample />, loader: idLoader },
        { path: ':uid', element: <Sample />, loader: idLoader },
      ]},
      { path: 'edit', children: [
        { index: true, element: <Edit /> },
        { path: 'view', children: [
          { index: true, element: <View />, loader: idLoader },
          { path: ':uid', element: <View />, loader: idLoader }
        ]},
        { path: 'making', children: [
          { index: true, element: <Making />, loader: idLoader },
          { path: ':uid', element: <Making />, loader: idLoader }
        ]},
      ]},
      { path: 'battle', element: <Battle /> }
    ]
  }
])
