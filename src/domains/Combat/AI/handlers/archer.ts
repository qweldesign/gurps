// Combat/AI/handlers/archer.ts

import { type TacticHandler } from '../handler'
import { SPELL_ELEMENTS } from '../../Spells'
import { lightWarrior } from './lightWarrior'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 弓使い: 後衛から射撃
 *
 * 0-a. 狂戦士状態
 * 弓は近接戦闘に使えないため, 予備武器 (近接武器) に持ち替えた上で,
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 * 後衛へ戻ったら, 弓 (main) に持ち替え直す (前衛にいる間は近接武器 (spare) のまま「軽戦士」として応戦する)
 *
 * 1. 準備
 * 準備が必要な場合は準備
 *
 * 2. 狙いの持ち越し
 * 前ターンの「狙い」が成功して持ち越されており (対象が防御を試みる等で破棄されておらず, かつ対象がまだ有効
 * (生存・気絶していない) ) なら, ターゲット選定を行わずその対象への「射撃」を優先する
 *
 * 3. 自身の攻撃目標値によるターゲット分岐
 * 敵の後衛への自身の攻撃目標値が13以上なら後衛をターゲットとする
 * 更に後衛をターゲットとする場合, 精神集中のターン数が最も長い目標をターゲットとする
 * 敵の後衛への自身の攻撃目標値が12なら, 50% の確率分岐で 前衛 か 後衛 をターゲットとする
 * それ以外なら前衛をターゲットとする
 *
 * 4. 敵の防御目標値によるターゲット分岐
 * 最も防御目標値の低い敵をターゲットとする
 *
 * 5. 攻撃/狙い
 * 敵の防御目標値が11以下なら攻撃, そうでないなら狙い
 */
export const archer: TacticHandler = (actor, state) => {
  const { availability, target } = state.action!

  // 0-a. 狂戦士状態 (弓 (main) は近接戦闘に使えないため, 予備武器 (spare: レイピア/ダガー) に持ち替えてから委譲する.
  // 持ち替え済み (または持ち替え不能) なら, そのまま「軽戦士」の行動パターンに委譲する)
  if (actor.statusEffects.berserk) {
    if (actor.attack.key !== 'spare' && availability.changeWeapon) {
      return { key: 'changeWeapon', options: { weaponSlotKey: 'spare' }, targets: [] }
    }
    return lightWarrior(actor, state)
  }

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る. 後衛に戻れたら弓 (main) に持ち替え直す
  if (actor.position !== 'back') {
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state)
  }
  if (actor.attack.key !== 'main' && availability.changeWeapon) {
    return { key: 'changeWeapon', options: { weaponSlotKey: 'main' }, targets: [] }
  }

  // 1. 準備
  if (actor.attack.ready > 0) {
    return availability.ready ? { key: 'ready', options: {}, targets: [] } : { key: 'wait', options: {}, targets: [] }
  }

  // 2. 狙いの持ち越し (前ターンの「狙い」が成功して持ち越されており, 対象がまだ有効なら, その対象への射撃を優先する)
  const pendingSnipe = actor.attack.feint
  if (pendingSnipe && pendingSnipe.source === 'snipe' && !pendingSnipe.currentTurn && target.enemies.includes(pendingSnipe.target)) {
    return availability.shoot ? { key: 'shoot', options: { aim: 'body' }, targets: [pendingSnipe.target] } : { key: 'wait', options: {}, targets: [] }
  }

  const enemies = target.enemies
  if (enemies.length === 0) return { key: 'wait', options: {}, targets: [] }

  // 3. 自身の攻撃目標値によるターゲット分岐
  const backEnemies = enemies.filter(unit => unit.position === 'back')
  const frontEnemies = enemies.filter(unit => unit.position !== 'back')
  let chosen: typeof enemies[number] | null = null

  if (backEnemies.length > 0) {
    // 更に後衛をターゲットとする場合, 精神集中のターン数が最も長い目標をターゲットとする
    const longestCastTarget = backEnemies.reduce((best, unit) => {
      const unitTurns = Math.max(...SPELL_ELEMENTS.map(element => unit.spellCast[element]))
      const bestTurns = Math.max(...SPELL_ELEMENTS.map(element => best.spellCast[element]))
      return unitTurns > bestTurns ? unit : best
    })
    const attackValue = actor.attack.getTarget('body', 'none', longestCastTarget, state.foggy)
    if (attackValue >= 13 || (attackValue === 12 && chance())) chosen = longestCastTarget
  }

  // 4. 敵の防御目標値によるターゲット分岐 (前衛から, 最も防御目標値の低い対象を選ぶ)
  if (!chosen) {
    const candidates = frontEnemies.length > 0 ? frontEnemies : backEnemies
    chosen = pickLowestDefenseTarget(actor, candidates)
  }
  if (!chosen) return { key: 'wait', options: {}, targets: [] }

  // 5. 攻撃/狙い
  const defenseValue = chosen.defense.getTarget(actor, 'body')
  if (defenseValue <= 11) {
    return availability.shoot ? { key: 'shoot', options: { aim: 'body' }, targets: [chosen] } : { key: 'wait', options: {}, targets: [] }
  }
  return availability.snipe ? { key: 'snipe', options: {}, targets: [chosen] } : { key: 'wait', options: {}, targets: [] }
}
