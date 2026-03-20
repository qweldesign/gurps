import { useState } from 'react'
import { type ActionType, type ActionRequest, CombatActionStore as Store } from '../../combat/ActionStore'
import { CombatLog as Log } from '../../combat/Log'

type ActionPalette = 'main' | 'move' | 'hidden'

function Action({ store, log, nextTurn }: { store: Store, log: Log, nextTurn: (log: Log) => Promise<void> }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('main')

  // execute
  const execute = async (type: ActionType, option: string | null = null) => {
    // パレットを非表示
    setActionPalette('hidden')
    // ActionRequest を作成し, execute
    const request = { type, option } as ActionRequest
    store.execute(request)
    // ログを更新し, 親コンポーネントに返す
    log.receiveRequest(request)
    await nextTurn(log) // ログの再生完了を待つ
    // ログの再生完了後にパレットを戻す
    setActionPalette('main')
  }

  return (
    <>
      <div className="absolute top-0 left-0 w-1/1 my-3 italic text-sm text-center">第 {store.round} ターン / {store.actor.name} の行動</div>
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
