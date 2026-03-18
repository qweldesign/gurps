import { useState } from 'react'
import { type ActionRequest, CombatActionStore as Store } from '../../combat/ActionStore'

type ActionPalette = 'main' | 'move'

function Action({ store, nextTurn }: { store: Store, nextTurn: () => void }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('main')

  // execute
  const execute = (type: string, option: string | null = null) => {
    store.execute({ type, option } as ActionRequest)
    setActionPalette('main')
    nextTurn()
  }

  return (
    <>
      <div className="actions" data-disable={actionPalette !== 'main'}>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => setActionPalette('move')}
        >移動</button>
        <button
          disabled={!store.availability.wait}
          onClick={() => execute('wait')}
        >待機</button>
      </div>
      <div className="actions subActions" data-disable={actionPalette !== 'move'}>
        <button
          disabled={!store.availability.move.left}
          onClick={() => execute('move', 'left')}
        >左翼</button>
        <button
          disabled={!store.availability.move.center}
          onClick={() => execute('move', 'center')}
        >中央</button>
        <button
          disabled={!store.availability.move.right}
          onClick={() => execute('move', 'right')}
        >右翼</button>
        <button
          disabled={!store.availability.move.back}
          onClick={() => execute('move', 'back')}
        >後退</button>
        <button
          onClick={() => setActionPalette('main')}
        >戻る</button>
      </div>
    </>
  )
}

export default Action
