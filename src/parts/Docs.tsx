import { useLoaderData, Link } from 'react-router-dom'
import { chapters } from '../types/chapters'

function Docs() {
  const { data, content } = useLoaderData()

  return (
    <div className="row">
      <article className="primary-col">
        <h2>{data.Chapter}</h2>
        <h3>{data.Section}</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
      <aside className="secondary-col">
        <h2>目次</h2>
        <ol className="docs-nav">
          <li className="docs-nav__chapter"><Link to="/docs/">序章</Link></li>
          {chapters.map((chapter) => (
            <li key={chapter.order} className="docs-nav__chapter">
              <details>
                <summary>{chapter.heading}</summary>
                <ol className="docs-nav__sections">
                  {chapter.sections.map((section) => (
                    <li key={section.order} className="docs-nav__section">
                      <Link to={`/docs/${chapter.order}-${section.order}`}>{section.heading}</Link>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}

export default Docs