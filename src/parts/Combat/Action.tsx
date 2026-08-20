// Combat/Action.tsx

import { useState, useEffect } from 'react'
import { WEAPON_SLOT_KEYS } from '../../domains/Equipments'
import { type Position, POSTURE_MODS, type Posture, type CombatUnit as Unit } from '../../domains/Combat/Unit'
import { SPELL_ELEMENTS, SPELL_ELEMENT_LABELS, SPELL_LIST, type SpellElement } from '../../domains/Combat/Spells'
import { type ActionKey, POSITION_LABELS, FULL_POWER_KEYS, FULL_POWER_OPTIONS, AIM_KEYS, AIM_OPTIONS, type ActionOptions, type ActionRequest, CombatAction as Store } from '../../domains/Combat/Action'

type ActionPalette = 'main' | 'confirmReady' | 'confirmAttack' | 'confirmFeint' | 'confirmSpell' | 'confirmDefense' | 'attackOption' | 'aim' | 'elements' | 'spell' | 'move' | 'changeWeapon' | 'changePosture' | 'target' | 'hidden'

type TargetPalette = 'attack' | 'feint' | 'shoot' | 'snipe' | 'spell' | 'all'

function Action({ store }: { store: Store }) {
  // 状態管理
  const [actionPalette, setActionPalette] = useState<ActionPalette>('hidden')
  const [targetPalette, setTargetPalette] = useState<TargetPalette>('all')
  const [actionKey, setActionKey] = useState<ActionKey>('wait')
  const [actionOptions, setActionOptions] = useState<ActionOptions>({})
  const [actionTargets, setActionTargets] = useState<Unit[]>([])
  const [isExecuted, setIsExecuted] = useState<boolean>(false)

  // 攻撃実行前確認パレット用の選択中ターゲット
  const target = actionTargets[0]

  // 法術の対象選択パレット用の対象プール (術の targetScope に応じて出し分ける)
  const spellTargetPool = actionOptions.element !== undefined && actionOptions.spellId !== undefined
    ? (() => {
        const scope = SPELL_LIST[actionOptions.element][actionOptions.spellId].targetScope
        return scope === 'all' ? store.target.all
          : scope === 'enemy' ? store.target.enemies
          : scope === 'puppet' ? store.target.puppet
          : store.target.allies
      })()
    : []

  // execute
  const execute = async () => {
    const request = { key: actionKey, options: actionOptions, targets: actionTargets } as ActionRequest
    await store.execute(request)
    // 射撃・法術など, ターンを終えない行動の直後は store.unlocked が同一関数呼び出し内で false→true に戻るため,
    // 以下の useEffect ([store.unlocked] の変化を検知する) では変化を捉えられずパレットがリセットされない
    // ここで直接検知し, 同じ行動者のまま次のコマンド選択に戻れるようにする
    if (store.unlocked) reset()
  }

  // execute後, 変数を初期状態に戻す
  const reset = () => {
    setActionPalette('main')
    setActionKey('wait')
    setActionOptions({})
    setActionTargets([])
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
          disabled={!store.availability.ready}
          onClick={() => { setActionPalette('confirmReady'); setActionKey('ready'); }} // 準備確認パレットへ進む
        >準備</button>
        <button
          disabled={!store.availability.attack}
          onClick={() => { setActionPalette('target'); setTargetPalette('attack'); setActionKey('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, ターゲットパレットへ進む
        >攻撃</button>
        <button
          disabled={!store.availability.feint}
          onClick={() => { setActionPalette('target'); setTargetPalette('feint'); setActionKey('feint'); }} // ターゲットパレットへ進む
        >牽制</button>
        <button
          disabled={!store.availability.fullAttack}
          onClick={() => { setActionPalette('attackOption'); setTargetPalette('attack'); setActionKey('attack'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // デフォルトオプションをセットし, 攻撃オプションパレットへ進む
        >特殊攻撃</button>
        <button
          disabled={!store.availability.shoot}
          onClick={() => { setActionPalette('aim'); setTargetPalette('shoot'); setActionKey('shoot'); setActionOptions({ aim: 'body' }); }} // デフォルトオプションをセットし, 部位狙いオプションパレットへ進む (射撃は全力攻撃不可, 部位狙いのみ選択可)
        >射撃</button>
        <button
          disabled={!store.availability.snipe}
          onClick={() => { setActionPalette('target'); setTargetPalette('snipe'); setActionKey('snipe'); }} // ターゲットパレットへ進む
        >狙い</button>
        <button
          disabled={SPELL_ELEMENTS.every(element => !store.availability.cast[element])}
          onClick={() => { setActionPalette('elements'); setActionKey('cast'); }} // 五行選択パレットへ進む
        >集中</button>
        <button
          disabled={!store.availability.spell}
          onClick={() => { setActionPalette('spell'); setActionKey('spell'); }} // 法術選択パレットへ進む
        >法術</button>
        <button
          disabled={!store.availability.defense}
          onClick={() => { setActionPalette('confirmDefense'); setActionKey('defense'); }} // 防御確認パレットへ進む
        >全力防御</button>
        <button
          disabled={!store.availability.move.back && !store.availability.move.left && !store.availability.move.center && !store.availability.move.right}
          onClick={() => { setActionPalette('move'); setActionKey('move'); }} // 移動オプションパレットへ進む
        >移動</button>
        <button
          disabled={!store.availability.changeWeapon}
          onClick={() => { setActionPalette('changeWeapon'); setActionKey('changeWeapon'); }} // 装備変更オプションパレットへ進む
        >装備変更</button>
        <button
          disabled={!store.availability.changePosture.standing && !store.availability.changePosture.crouching && !store.availability.changePosture.kneeling && !store.availability.changePosture.prone}
          onClick={() => { setActionPalette('changePosture'); setActionKey('changePosture'); }} // 姿勢変更オプションパレットへ進む
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
        {target && (
          <div className="confirm__grid">
            <div>{store.actor.name}</div>
            <div>{target.name}</div>
            <div>{store.actor.attack.model.name}: {store.actor.attack.model.dmgName}</div>
            <div>{target.defense.getModelByKey(AIM_OPTIONS[actionOptions.aim ?? 'body'].group).name}: {target.defense.getModelByKey(AIM_OPTIONS[actionOptions.aim ?? 'body'].group).dr}</div>
            <div>攻撃目標値: {store.actor.attack.getTarget(actionOptions.aim ?? 'body', actionOptions.fullPower ?? 'none', target, store.foggy)}</div>
            <div className={actionTargets[0] === store.actor.attack.feint?.target ? 'is-targeted' : ''}>防御目標値: {target.defense.getTarget(store.actor, actionOptions.aim ?? 'body')}</div>
            <div>効果: </div>
            <div>ダメージ {store.actor.attack.getExpectedDmg(actionOptions.fullPower ?? 'none', target.defense.getDR(AIM_OPTIONS[actionOptions.aim ?? 'body'].group, store.actor.attack.model.dmgType))} 点</div>
          </div>
        )}
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('target'); setActionTargets([]); }} // ターゲットをリセットし, ターゲットパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmFeint'}>
        {target && (
          <div className="confirm__grid">
            <div>{store.actor.name}</div>
            <div>{target.name}</div>
            <div>攻撃目標値: {store.actor.attack.getTarget('body', 'none', target, store.foggy)}</div>
            <div>防御目標値: {target.defense.getTarget(store.actor, 'body')}</div>
            <div>効果: </div>
            <div>{actionKey === 'feint' ? '牽制' : '狙い'} 防御目標値の低下</div>
          </div>
        )}
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('target'); setActionTargets([]); }} // ターゲットをリセットし, ターゲットパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions confirm" data-disable={actionPalette !== 'confirmSpell'}>
        {actionOptions.element !== undefined && actionOptions.spellId !== undefined && target && (
          <div className="confirm__grid">
            <div>{store.actor.name}</div>
            <div className="text-left">{SPELL_ELEMENT_LABELS[actionOptions.element]}: {SPELL_LIST[actionOptions.element][actionOptions.spellId].label}</div>
            <div>対象: {target.name}</div>
          </div>
        )}
        <button
          onClick={() => { setIsExecuted(true); }} // 実行
        >実行</button>
        <button
          onClick={() => { setActionPalette('spell'); setActionOptions({}); setActionTargets([]); }} // オプション・ターゲットをリセットし, 法術選択パレットへ戻る
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
        {!store.availability.ready && FULL_POWER_KEYS.map(key => key !== 'none' && key !== 'ready' && (
          <button
            className="is-large"
            key={key}
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: key }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >{FULL_POWER_OPTIONS[key].label}</button>
        ))}
        {!store.availability.ready && (
          <button
            className="is-large"
            disabled={!store.availability.attack} // 部位狙いは fullPower: 'none' (通常攻撃) 相当のため, 狂戦士状態では選択不可 (全力攻撃が強制される)
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: 'none' }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >部位狙い</button>
        )}
        {store.availability.ready && (
          // 武器が非準備状態の場合,「2回攻撃」等の代わりに「準備即攻撃」のみ選択可能 (非準備状態のまま全力攻撃で攻撃する)
          <button
            className="is-large"
            onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body', fullPower: 'ready' }); }} // 攻撃オプションをセットし, 部位狙いパレットへ進む
          >{FULL_POWER_OPTIONS.ready.label}</button>
        )}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'aim'}>
        {AIM_KEYS.map(key => (
          <button
            className={`is-small ${((key !== 'leg' && key !== 'foot') || store.availability.legAttack) ? '' : 'hidden'}`}
            key={key}
            onClick={() => { setActionPalette('target'); setActionOptions({ ...actionOptions, aim: key }); }} // 部位狙いをセットし, ターゲットパレットへ進む
          >{`${AIM_OPTIONS[key].label} (${AIM_OPTIONS[key].mod})`}</button>
        ))}
        <button
          onClick={() => actionKey === 'shoot' ? reset() : (setActionPalette('attackOption'), setActionOptions({}))} // 射撃時は全てリセット, それ以外は攻撃オプションのみリセットして攻撃オプションパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'elements'}>
        {Object.entries(SPELL_ELEMENT_LABELS).map(([element, label]) => (
          <button
            key={element}
            disabled={!store.availability.cast[element as SpellElement]}
            onClick={() => { setActionOptions({ element: element as SpellElement }); setIsExecuted(true); }} // 実行
          >{label}</button>
        ))}
        <button
          onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
        >戻る</button>
      </div>
      <div className="actions option" data-disable={actionPalette !== 'spell'}>
        {SPELL_ELEMENTS.map(element => SPELL_LIST[element].filter(spell => spell.spellType !== 'defense').map(spell => (
          // 技能値による解禁レベル未満, 詠唱時間ゼロ, 該当する術に必要な詠唱時間未満のいずれかであれば非表示
          // spellType: 'defense' (盾・時間遡行) は防御時に自動発動する術のため, このパレットには表示しない
          <button
            className="is-small"
            key={`${element}:${spell.id}`}
            disabled={spell.id >= store.actor.spells[element] - 10 || store.actor.spellCast[element] < spell.spellCast}
            onClick={() => {
              setActionOptions({ element, spellId: spell.id })
              if (spell.targetScope) {
                // 対象範囲が指定された術は対象選択を要するため, ターゲットパレットへ進む
                setActionPalette('target')
                setTargetPalette('spell')
              } else {
                // 対象を要さない術は暫定的に自身を対象とし, 確認パレットへ進む
                setActionTargets([store.actor])
                setActionPalette('confirmSpell')
              }
            }}
          >{spell.label}</button>
        )))}
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
        {WEAPON_SLOT_KEYS.map(key => key !== 'shield' && store.actor.attack.getModelByKey(key).name !== '装備無し' && (
          <button
            className={`is-large ${key === store.actor.attack.key ? 'is-current' : ''}`}
            key={key}
            onClick={() => { setActionOptions({ weaponSlotKey: key }); if (key !== store.actor.attack.key) setIsExecuted(true); }} // 実行 (既に構えている武器の場合は実行しない)
          >{store.actor.attack.getModelByKey(key).name}</button>
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
                key={target.combatId}
                onClick={() => { setActionPalette('confirmAttack'); setActionTargets([target]); }} // ターゲットをセットし, 攻撃確認パレットへ進む
              >{target.name}</button>
            ))}
            {actionOptions.aim === 'body' && ( // 通常射撃時
              <button
                onClick={() => { reset(); }} // 全てリセットし, メインパレットへ戻る
              >戻る</button>
            )}
            {actionOptions.aim !== 'body' && ( // 部位狙い射撃時
              <button
                onClick={() => { setActionPalette('aim'); setActionOptions({ aim: 'body' }); }} // 部位狙いのみリセットし, 部位狙いパレットへ戻る
              >戻る</button>
            )}
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
        {targetPalette === 'spell' && (
          <>
            {spellTargetPool.map(target => ( // 術の targetScope に応じたプール (ally/enemy/all) から選択する
              <button
                key={target.combatId}
                onClick={() => { setActionPalette('confirmSpell'); setActionTargets([target]); }} // ターゲットをセットし, 法術確認パレットへ進む
              >{target.name}</button>
            ))}
            <button
              onClick={() => { setActionPalette('spell'); setActionOptions({}); }} // オプションをリセットし, 法術選択パレットへ戻る
            >戻る</button>
          </>
        )}
      </div>
    </>
  )
}

export default Action
