import { useState, useEffect } from 'react'
import { ATTACK_KEYS, type AttackKey } from '../../domains/Equipments'
import { type Position } from '../../combat/FormationStore'
import { type ActionType, POSITION_LABELS, FULL_POWER_KEYS, FULL_POWER_OPTIONS, AIM_KEYS, AIM_OPTIONS, type ActionOptions, type ActionRequest, CombatActionStore as Store } from '../../combat/ActionStore'
import { POSTURE_MODS, type Posture, CombatUnit as Unit } from '../../combat/Unit'
import { SPELL_ELEMENT_LABELS, SPELL_LIST, type SpellElement } from '../../combat/Spells'

type ActionPalette = 'main' | 'confirmReady' | 'confirmAttack' | 'confirmFeint' | 'confirmSpell' | 'confirmDefense' | 'attackOption' | 'aim' | 'elements' | 'spell' | 'move' | 'changeWeapon' | 'changePosture' | 'target' | 'hidden'

type TargetPalette = 'attack' | 'feint' | 'shoot' | 'snipe' | 'all'

function Action({ store }: { store: Store }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('hidden')
  const [targetPalette, setTargetPalette] = useState<TargetPalette>('all')
  const [actionType, setActionType] = useState<ActionType>('wait')
  const [actionOptions, setActionOptions] = useState<ActionOptions>({})
  const [actionTargets, setActionTargets] = useState<Unit[]>([store.actor])
  const [isExecuted, setIsExecuted] = useState<boolean>(false)

  // execute
  const execute = async () => {
    // ActionRequest を作成し, execute
    const request = { type: actionType, options: actionOptions, targets: actionTargets } as ActionRequest
    await store.execute(request)
  }

  // execute後, 変数を初期状態に戻す
  const reset = () => {
    setActionPalette('main')
    setActionType('wait')
    setActionOptions({})
    setActionTargets([store.actor])
    setIsExecuted(false)
  }

  useEffect(() => {
    // ロック状態の切り替わりを検知し, パレットの表示状態を更新
    if (store.unlocked) {
      reset()
    } else {
      setActionPalette('hidden')
    }
  }, [store.unlocked])

  useEffect(() => {
    // isExecuted が true に変わるのを検知して実行
    if(isExecuted) execute()
  }, [isExecuted])

  return (
    <>
      <div className="absolute top-0 left-0 w-1/1 my-3 italic text-sm text-center">第 {store.round} ターン / {store.actor.name} の行動</div>
      <div className="actions" data-disable={actionPalette !== 'main'}>
        <button
          disabled={!store.availability.ready}
          onClick={() => { setActionPalette('confirmReady'); setActionType('ready'); }} // 準備確認パレットへ進む
        >準備</button>
        <button
          disabled={!store.availability.attack}
          onClick={() => { setActionPalette('target'); setTargetPalette('attack'); setActionType('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, ターゲットパレットへ進む
        >攻撃</button>
        <button
          disabled={!store.availability.attack}
          onClick={() => { setActionPalette('target'); setTargetPalette('feint'); setActionType('feint'); }} // ターゲットパレットへ進む
        >牽制</button>
        <button
          disabled={!store.availability.fullPowerAttack}
          onClick={() => { setActionPalette('attackOption'); setTargetPalette('attack'); setActionType('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, 攻撃オプションパレットへ進む
        >特殊攻撃</button>
        <button
          disabled={!store.availability.shoot}
          onClick={() => { setActionPalette('target'); setTargetPalette('shoot'); setActionType('shoot'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, ターゲットパレットへ進む
        >射撃</button>
        <button
          disabled={!store.availability.snipe}
          onClick={() => { setActionPalette('target'); setTargetPalette('snipe'); setActionType('snipe'); }} // ターゲットパレットへ進む
        >狙い</button>
        <button
          disabled={!store.availability.cast.wood && !store.availability.cast.fire && !store.availability.cast.earth && !store.availability.cast.metal && !store.availability.cast.water}
          onClick={() => { setActionPalette('elements'); setActionType('cast'); }} // 五行選択パレットへ進む
        >集中</button>
        <button
          disabled={!store.availability.spell}
          onClick={() => { setActionPalette('spell'); setActionType('spell'); }} // 法術選択パレットへ進む
        >法術</button>
        <button
          disabled={!store.availability.defense}
          onClick={() => { setActionPalette('confirmDefense'); setActionType('defense'); }} // 防御確認パレットへ進む
        >全力防御</button>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => { setActionPalette('move'); setActionType('move'); }} // 移動オプションパレットへ進む
        >移動</button>
        <button
          disabled={!store.availability.changeWeapon}
          onClick={() => { setActionPalette('changeWeapon'); setActionType('changeWeapon'); }} // 装備変更オプションパレットへ進む
        >装備変更</button>
        <button
          disabled={!store.availability.changePosture.standing && !store.availability.changePosture.crouching && !store.availability.changePosture.kneeling && !store.availability.changePosture.prone}
          onClick={() => { setActionPalette('changePosture'); setActionType('changePosture'); }} // 姿勢変更オプションパレットへ進む
        >姿勢変更</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmReady'}>
        <div className="confirm__grid">
          <div>{store.actor.name}</div>
          <div className="text-left">{store.actor.attack.model.name} を構える</div>
        </div>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmAttack'}>
        <div className="confirm__grid">
          <div>{store.actor.name}</div>
          <div>{actionTargets[0]?.name}</div>
          <div>{store.actor.attack.model.name}: {store.actor.attack.model.dmgName}</div>
          <div>{(actionTargets[0]?.defense.getModel(AIM_OPTIONS[actionOptions.aim ?? 'body'].group))?.name}: {(actionTargets[0]?.defense.getModel(AIM_OPTIONS[actionOptions.aim ?? 'body'].group))?.dr}</div>
          <div>攻撃目標値: {store.actor.attack.getTarget(actionOptions.aim ?? 'body', actionOptions.fullPower, actionTargets[0])}</div>
          <div className={actionTargets[0] === store.actor.attack.feint?.target ? 'is-targeted' : ''}>防御目標値: {actionTargets[0]?.defense.getTarget(store.actor, actionOptions.aim!)}</div>
          <div>効果: </div>
          <div>ダメージ {store.actor.attack.getExpectedDmg(actionOptions.fullPower ?? 'none', actionTargets[0]?.defense.getDR(AIM_OPTIONS[actionOptions.aim ?? 'body'].group, store.actor.attack.model.dmgType))} 点</div>
        </div>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('target'); setActionTargets([store.actor]); }} // ターゲットをリセットし, ターゲットパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmFeint'}>
        <div className="confirm__grid">
          <div>{store.actor.name}</div>
          <div>{actionTargets[0]?.name}</div>
          <div>攻撃目標値: {store.actor.attack.getTarget('body', 'none', actionTargets[0])}</div>
          <div>防御目標値: {actionTargets[0]?.defense.target}</div>
          <div>効果: </div>
          <div>{actionType === 'feint' ? '牽制' : '狙い'} (防御目標値の低下)</div>
        </div>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('target'); setActionTargets([store.actor]); }} // ターゲットをリセットし, ターゲットパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmSpell'}>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('spell'); setActionOptions({}); }} // オプションをリセットし, 法術選択パレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmDefense'}>
        <div className="confirm__grid">
          <div>{store.actor.name}</div>
          <div className="text-left">全力防御</div>
        </div>
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'attackOption'}>
        {!store.availability.ready && FULL_POWER_KEYS.map(key => key !== 'none' && (
          <button
            className="is-large"
            key={key}
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: key }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >{FULL_POWER_OPTIONS[key].label}</button>
        ))}
        {!store.availability.ready && (
          <button
            className="is-large"
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >部位狙い</button>
        )}
        {store.availability.ready && (
          <button
            className="is-large"
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >準備即攻撃</button>
        )}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'aim'}>
        {AIM_KEYS.map(key => (
          <button
            className={`is-small ${((key !== 'leg' && key !== 'foot') || store.availability.legAttack) ? '' : 'hidden' }`}
            key={key}
            onClick={() => { setActionPalette('target'); setActionOptions({ ...actionOptions, aim: key }); }} // 部位狙いをセットし, ターゲットパレットへ進む
          >{`${AIM_OPTIONS[key].label} (${AIM_OPTIONS[key].mod})`}</button>
        ))}
        <button
          onClick={() => { setActionPalette('attackOption'); setActionOptions({}) }} // 攻撃オプションをリセットし, 攻撃オプションパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'elements'}>
        {Object.entries(SPELL_ELEMENT_LABELS).map((arr) => (
          <button
            key={arr[0]}
            disabled={!store.availability.cast[arr[0] as SpellElement]}
            onClick={() => { setActionOptions({ element: arr[0] as SpellElement }); setIsExecuted(true); }} // 実行
          >{arr[1]}</button>
        ))}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'spell'}>
        {Object.entries(SPELL_LIST).map((arr) => {
          const element = arr[0] as SpellElement
          const spells = arr[1]
          return spells.map(spell => (
            <button
              className={spell.spellCast > store.actor.spellCast[element] || spell.spellType === 'defense' ? 'is-disable' : ''}
              key={`${element}:${spell.id}`}
              disabled={spell.id >= store.actor.spells[element] - 10 || store.actor.spellCast[element] === 0}
              onClick={() => { setActionPalette('confirmSpell'); setActionOptions({ element, spellId: spell.id }); }} // 確認
            >{spell.label}</button>
          ))
        })}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
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
      <div className="actions option" data-disable={actionPalette !== 'changeWeapon'}>
        {ATTACK_KEYS.map(key => key !== 'shield' && store.actor.attack.getModel(key).name !== '装備無し' &&(
          <button
            className={`is-large ${key === store.actor.attack.key ? 'is-current' : ''}`}
            key={key}
            onClick={() => { setActionOptions({ attackKey: key as AttackKey }); if (key !== store.actor.attack.key) setIsExecuted(true); }} // 実行
          >{store.actor.attack.getModel(key).name}</button>
        ))}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'changePosture'}>
        {Object.entries(POSTURE_MODS).map((arr) => (
          <button
            key={arr[0]}
            disabled={!store.availability.changePosture[arr[0] as Posture]}
            onClick={() => { setActionOptions({ posture: arr[0] as Posture }); setIsExecuted(true); }} // 実行
          >{arr[1].label}</button>
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
                className={store.actor.attack.feint?.target === target ? 'is-targeted' : ''}
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
        {targetPalette === 'feint' && (
          <>
            {store.target.melee.map(target => (
              <button
                key={target.combatId}
                onClick={() => { setActionPalette('confirmFeint'); setActionTargets([target]); }} // ターゲットをセットし, 牽制確認パレットへ進む
              >{target.name}</button>
            ))}
            <button
              onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
            >戻る</button>
          </>
        )}
        {targetPalette === 'shoot' && (
          <>
            {store.target.enemies.map(target => (
              <button
                className={store.actor.attack.feint?.target === target ? 'is-targeted' : ''}
                key={target.combatId}
                onClick={() => { setActionPalette('confirmAttack'); setActionTargets([target]); }} // ターゲットをセットし, 攻撃確認パレットへ進む
              >{target.name}</button>
            ))}
            <button
              onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
            >戻る</button>
          </>
        )}
        {targetPalette === 'snipe' && (
          <>
            {store.target.enemies.map(target => (
              <button
                key={target.combatId}
                onClick={() => { setActionPalette('confirmFeint'); setActionTargets([target]); }} // ターゲットをセットし, 牽制確認パレットへ進む
              >{target.name}</button>
            ))}
            <button
              onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
            >戻る</button>
          </>
        )}
      </div>
    </>
  )
}

export default Action
