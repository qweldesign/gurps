// Combat/AI/handlers/archer.ts

import { type TacticHandler } from '../handler'
import { SPELL_ELEMENTS } from '../../Spells'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 弓使い: 後衛から射撃
 * 
 * 1. 準備
 * 準備が必要な場合は準備
 * 
 * 2. 自身の攻撃目標値によるターゲット分岐
 * 敵の後衛への自身の攻撃目標値が13以上なら後衛をターゲットとする
 * 更に後衛をターゲットとする場合, 精神集中のターン数が最も長い目標をターゲットとする
 * 敵の後衛への自身の攻撃目標値が12なら, 50% の確率分岐で 前衛 か 後衛 をターゲットとする
 * それ以外なら前衛をターゲットとする
 * 
 * 3. 敵の防御目標値によるターゲット分岐
 * 最も防御目標値の低い敵をターゲットとする
 * 
 * 4. 攻撃/狙い
 * 敵の防御目標値が11以下なら攻撃, そうでないなら狙い
 */
export const archer: TacticHandler = (actor, state) => {
  const { availability, target } = state.action!

  // 1. 準備
  if (actor.attack.ready > 0) {
    return availability.ready ? { key: 'ready', options: {}, targets: [] } : { key: 'wait', options: {}, targets: [] }
  }

  const enemies = target.enemies
  if (enemies.length === 0) return { key: 'wait', options: {}, targets: [] }

  // 2. 自身の攻撃目標値によるターゲット分岐
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

  // 3. 敵の防御目標値によるターゲット分岐 (前衛から, 最も防御目標値の低い対象を選ぶ)
  if (!chosen) {
    const candidates = frontEnemies.length > 0 ? frontEnemies : backEnemies
    chosen = pickLowestDefenseTarget(actor, candidates)
  }
  if (!chosen) return { key: 'wait', options: {}, targets: [] }

  // 4. 攻撃/狙い
  const defenseValue = chosen.defense.getTarget(actor, 'body')
  if (defenseValue <= 11) {
    return availability.shoot ? { key: 'shoot', options: { aim: 'body' }, targets: [chosen] } : { key: 'wait', options: {}, targets: [] }
  }
  return availability.snipe ? { key: 'snipe', options: {}, targets: [chosen] } : { key: 'wait', options: {}, targets: [] }
}
