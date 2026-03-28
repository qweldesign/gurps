//docsLoader.ts

import { renderMarkdown } from './markdown'

export async function docsLoader({ params }: { params?: { docsId?: string } }) {
  const id = params?.docsId ?? '00'

  const res = await fetch(`/docs/${id}.md`)
  if (!res.ok) throw new Response('Not Found', { status: 404 })

  const raw = await res.text()
  const { data, content } = parseFrontMatter(raw)

  return {
    data,
    content: renderMarkdown(content),
  }
}

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
    yaml.split('\n').map((line) => {
      const [key, ...rest] = line.split(':')
      return [key?.trim(), rest.join(':').trim()]
    })
  )

  return { data, content }
}
