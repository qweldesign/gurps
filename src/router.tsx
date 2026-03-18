// router.tsx

import { createBrowserRouter } from 'react-router'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'
import Sample from './parts/Sample'
import Setup from './parts/Setup'
import View from './parts/Setup/View'
import Edit from './parts/Setup/Edit'
import Confirm from './parts/Setup/Confirm'
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
      { path: 'setup', children: [
        { index: true, element: <Setup /> },
        { path: 'view', children: [
          { index: true, element: <View />, loader: idLoader },
          { path: ':uid', element: <View />, loader: idLoader }
        ]},
        { path: 'edit', children: [
          { index: true, element: <Edit />, loader: idLoader },
          { path: ':uid', element: <Edit />, loader: idLoader }
        ]},
        { path: 'confirm', children: [
          { index: true, element: <Confirm />, loader: idLoader },
          { path: ':uid', element: <Confirm />, loader: idLoader }
        ]},
      ]},
      { path: 'battle', element: <Battle /> }
    ]
  }
])
