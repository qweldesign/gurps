// router.tsx

import { createBrowserRouter } from 'react-router'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'
import Sample from './parts/Sample'
import Edit from './parts/Edit'
import View from './parts/Edit/View'
import Setting from './parts/Edit/Setting'
import Confirm from './parts/Edit/Confirm'
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
        { path: 'making', element: <Setting />, loader: idLoader },
        { path: 'view', children: [
          { index: true, element: <View />, loader: idLoader },
          { path: ':uid', element: <View />, loader: idLoader }
        ]},
        { path: 'setting', children: [
          { index: true, element: <Setting />, loader: idLoader },
          { path: ':uid', element: <Setting />, loader: idLoader }
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
