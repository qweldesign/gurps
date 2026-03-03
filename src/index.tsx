import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { marked, Renderer, type Tokens } from 'marked'
import './index.css'
import App from './App'
import Entrance from './parts/Entrance'
import Docs from './parts/Docs'
import Making from './parts/Making'
import Battle from './parts/Battle'

const renderer = new Renderer();
const originalTable = renderer.table.bind(renderer);

renderer.table = (token: Tokens.Table): string => {
  const tableHtml = originalTable(token);
  return `
    <div class="table-wrapper">
      ${tableHtml}
    </div>
  `;
};

marked.setOptions({ renderer });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Entrance /> },
      { path: '/docs/', children: [
        {
          element: <Docs />,
          index: true,
          loader: async () => {
            const res = await fetch('/docs/00.md')
            if (!res.ok) throw new Response('Not Found', { status: 404 })
            const raw = await res.text()
            const { data, content } = parseFrontMatter(raw)
            return {
              data,
              content: marked(content)
            }
          }
        },
        {
          element: <Docs />,
          path: ':docsId',
          loader: async ({ params }) => {
            const id = params.docsId ?? '00'
            const res = await fetch(`/docs/${id}.md`)
            if (!res.ok) throw new Response('Not Found', { status: 404 })
            const raw = await res.text()
            const { data, content } = parseFrontMatter(raw)
            return {
              data,
              content: marked(content)
            }
          }
        }
      ]
      },
      { path: '/making/', element: <Making /> },
      { path: '/battle/', element: <Battle /> }
    ]
  }
])

function parseFrontMatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/)

  if (!match) {
    return { data: {}, content: raw }
  }

  const [, yaml, content] = match

  if (!yaml || !content) {
    return { data: {}, content: raw }
  }

  const data = Object.fromEntries(
    yaml.split('\n').map(line => {
      const [key, ...rest] = line.split(':')
      return [key?.trim(), rest.join(':').trim()]
    })
  )

  return { data, content }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
