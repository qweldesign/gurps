import { useState, useEffect } from 'react'
import { type Position } from '../../combat/FormationStore'
import { type ActionType, POSITION_LABELS, FULL_POWER_KEYS, FULL_POWER_OPTIONS, AIM_KEYS, AIM_OPTIONS, type ActionOptions, type ActionRequest, CombatActionStore as Store } from '../../combat/ActionStore'
import { CombatLog as Log } from '../../combat/Log'
import { CombatUnit as Unit } from '../../combat/Unit'

type ActionPalette = 'main' | 'confirmAttack' | 'attackOption' | 'aim' | 'move' | 'target' | 'hidden'

type TargetPalette = 'attack' | 'all'

function Action({ store, log, nextTurn }: { store: Store, log: Log, nextTurn: (log: Log) => Promise<void> }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('main')
  const [targetPalette, setTargetPalette] = useState<TargetPalette>('all')
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
          disabled={!store.availability.attack}
          onClick={() => { setActionPalette('target'); setTargetPalette('attack'); setActionType('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, ターゲットパレットへ進む
        >攻撃</button>
        <button
          disabled={!store.availability.attack}
          onClick={() => { setActionPalette('attackOption'); setTargetPalette('attack'); setActionType('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, 攻撃オプションパレットへ進む
        >特殊攻撃</button>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => { setActionPalette('move'); setActionType('move'); }} // 移動オプションパレットへ進む
        >移動</button>
        <button
          disabled={!store.availability.wait}
          onClick={() => { setIsExecuted(true); }} // 実行
        >待機</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmAttack'}>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('target'); setActionTargets([]); }} // ターゲットをリセットし, ターゲットパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'attackOption'}>
        {FULL_POWER_KEYS.map(key => key !== 'none' && (
          <button
            className="is-large"
            key={key}
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: key }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >{FULL_POWER_OPTIONS[key].label}</button>
        ))}
        <button
          className="is-large"
          onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
        >部位狙い</button>
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'aim'}>
        {AIM_KEYS.map(key => (
          <button
            className="is-small"
            key={key}
            onClick={() => { setActionPalette('target'); setActionOptions({ ...actionOptions, aim: key }); }} // 部位狙いをセットし, ターゲットパレットへ進む
          >{`${AIM_OPTIONS[key].label} (${AIM_OPTIONS[key].mod})`}</button>
        ))}
        <button
          onClick={() => { setActionPalette('attackOption'); setActionOptions({}) }} // 攻撃オプションをリセットし, 攻撃オプションパレットへ戻る
        >戻る</button>
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
      <div className="actions target" data-disable={actionPalette !== 'target'}>
        {targetPalette === 'attack' && (
          <>
            {store.target.melee.map(target => (
              <button
                key={target.combatId}
                onClick={() => { setActionPalette('confirmAttack'); setActionTargets([target]); }} // ターゲットをセットし, 攻撃確認パレットへ進む
              >{target.name}</button>
            ))}
            {actionOptions.aim === 'body' && actionOptions.fullPower === 'none' && ( // 通常攻撃時
              <button
                onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
              >戻る</button>
            )}
            {(actionOptions.aim !== 'body' || actionOptions.fullPower !== 'none') && ( // 特殊攻撃時
              <button
                onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body' }); }} // 部位狙いのみリセットし, 部位狙いパレットへ戻る
              >戻る</button>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default Action
