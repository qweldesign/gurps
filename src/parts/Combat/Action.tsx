import { useState, useEffect } from 'react'
import { type Position } from '../../combat/FormationStore'
import { type ActionType, type ActionOptions, type ActionRequest, CombatActionStore as Store } from '../../combat/ActionStore'
import { POSITION_LABELS, CombatLog as Log } from '../../combat/Log'
import { CombatUnit as Unit } from '../../combat/Unit'

type ActionPalette = 'main' | 'move' | 'hidden'

function Action({ store, log, nextTurn }: { store: Store, log: Log, nextTurn: (log: Log) => Promise<void> }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('main')
  const [actionType, setActionType] = useState<ActionType>('wait')
  const [actionOptions, setActionOptions] = useState<ActionOptions>({})
  const [actionTargets, setActionTargets] = useState<Unit[]>([])
  const [isExecuted, setIsExecuted] = useState<boolean>(false)

  // execute
  const execute = async () => {
    // パレットを非表示
    setActionPalette('hidden')
    // ActionRequest を作成し, execute
    const request = { type: actionType, options: actionOptions, targets: actionTargets } as ActionRequest
    store.execute(request)
    // ログを更新し, 親コンポーネントに返す
    log.receiveRequest(request)
    await nextTurn(log) // ログの再生完了を待つ
    reset()
  }

  // execute後, 変数を初期状態に戻す
  const reset = () => {
    setActionPalette('main')
    setActionType('wait')
    setActionOptions({})
    setActionTargets([])
    setIsExecuted(false)
  }

  useEffect(() => {
    // isExecuted が true に変わるのを検知して実行
    if(isExecuted) execute()
  }, [isExecuted])

  return (
    <>
      <div className="absolute top-0 left-0 w-1/1 my-3 italic text-sm text-center">第 {store.round} ターン / {store.actor.name} の行動</div>
      <div className="actions" data-disable={actionPalette !== 'main'}>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => { setActionPalette('move'); setActionType('move'); }}
        >移動</button>
        <button
          disabled={!store.availability.wait}
          onClick={() => { setIsExecuted(true); }}
        >待機</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'move'}>
        {Object.entries(POSITION_LABELS).map((arr) => (
          <button
            key={arr[0]}
            disabled={!store.availability.move[arr[0] as Position]}
            onClick={() => { setActionOptions({ position: arr[0] as Position }); setIsExecuted(true); }}
          >{arr[1]}</button>
        ))}
        <button
          onClick={() => { reset(); }}
        >戻る</button>
      </div>
    </>
  )
}

export default Action
