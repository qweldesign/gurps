// Combat/Action.tsx

import { useState, useEffect } from 'react'
import { type Position } from '../../domains/Combat/Unit'
import { type ActionKey, POSITION_LABELS, type ActionOptions, type ActionRequest, CombatActionStore as Store } from '../../domains/Combat/Stores/ActionStore'

type ActionPalette = 'main' | 'move' | 'hidden'

function Action({ store }: { store: Store }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('hidden')
  const [actionKey, setActionKey] = useState<ActionKey>('wait')
  const [actionOptions, setActionOptions] = useState<ActionOptions>({})
  const [isExecuted, setIsExecuted] = useState<boolean>(false)

  // execute
  const execute = async () => {
    const request = { key: actionKey, options: actionOptions } as ActionRequest
    await store.execute(request)
  }

  // execute後, 変数を初期状態に戻す
  const reset = () => {
    setActionPalette('main')
    setActionKey('wait')
    setActionOptions({})
    setIsExecuted(false)
  }

  // ロック状態の切り替わりを検知し, パレットの表示状態を更新
  useEffect(() => {
    if (store.unlocked) {
      reset()
    } else {
      setActionPalette('hidden')
    }
  }, [store.unlocked])

  // isExecuted が true に変わるのを検知して実行
  useEffect(() => {
    if(isExecuted) execute()
  }, [isExecuted])

  return (
    <>
      <div className="absolute top-0 left-0 w-1/1 my-3 italic text-sm text-center">第 {store.round} ターン / {store.actor.name} の行動</div>
      <div className="actions" data-disable={actionPalette !== 'main'}>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => { setActionPalette('move'); setActionKey('move'); }} // 移動オプションパレットへ進む
        >移動</button>
        <button
          disabled={!store.availability.wait}
          onClick={() => { setIsExecuted(true); }} // 実行
        >待機</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'move'}>
        {Object.entries(POSITION_LABELS).map((arr) => (
          <button
            key={arr[0]}
            disabled={!store.availability.move[arr[0] as Position]}
            onClick={() => { setActionOptions({ position: arr[0] as Position }); setIsExecuted(true); }} // 実行
          >{arr[1]}</button>
        ))}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
    </>
  )
}

export default Action
