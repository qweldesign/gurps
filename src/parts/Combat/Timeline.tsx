// Combat/Timeline.tsx

import { type ReactNode, type Ref } from 'react'

function Timeline({ ref, messages }: {ref: Ref<HTMLDivElement>, messages: ReactNode[] }) {
  return (
    <div className="overflow-hidden">
      <div className="timeline px-3 text-sm" ref={ref}>
        {messages.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </div>
  )
}

export default Timeline
