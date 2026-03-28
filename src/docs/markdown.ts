// markdown.ts

import { marked, Renderer, type Tokens } from 'marked'

const renderer = new Renderer()
const originalTable = renderer.table.bind(renderer)

renderer.table = (token: Tokens.Table): string => {
  const tableHtml = originalTable(token)
  return `
    <div class="table-wrapper">
      ${tableHtml}
    </div>
  `
}

marked.setOptions({ renderer })

export function renderMarkdown(content: string) {
  return marked(content)
}
