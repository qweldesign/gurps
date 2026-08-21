// Combat/AI/utils.ts
//
// 各行動パターン (Combat/AI/handlers 配下) で共通して使う判定・選定ロジックをまとめる

import { type CombatState as State } from '../State'
import { type CombatUnit as Unit, type Side } from '../Unit'
import { type FullPower } from '../Action/types'

// 確率分岐 (デフォルトは 50%)
export function chance(probability: number = 0.5): boolean {
  return Math.random() < probability
}

// 朦朧状態・幻惑・目/耳/四肢の故障のいずれかに該当するか (「行動不能」とみなす目安. 気絶・死亡は対象選定の時点で除外済みのため含まない)
export function isIncapacitated(unit: Unit): boolean {
  return unit.health.stunned || unit.statusEffects.dazed > 0 ||
    unit.health.blinded || unit.health.deafened || unit.health.injuryOnArm || unit.health.injuryOnLeg
}

// 配置優先度 (デフォルト 中央→左翼→右翼) に従って候補から1体選ぶ (候補が空なら null)
export function pickByPositionPriority(candidates: Unit[], priority: Array<'left' | 'center' | 'right'> = ['center', 'left', 'right']): Unit | null {
  for (const position of priority) {
    const found = candidates.find(unit => unit.position === position)
    if (found) return found
  }
  return candidates[0] ?? null
}

// 防御目標値 (自身の牽制による修正込み) が最も低い候補を選ぶ (候補が空なら null)
export function pickLowestDefenseTarget(actor: Unit, candidates: Unit[]): Unit | null {
  return candidates.reduce<Unit | null>((best, unit) => {
    if (!best) return unit
    return unit.defense.getTarget(actor, 'body') < best.defense.getTarget(actor, 'body') ? unit : best
  }, null)
}

// 自身が攻撃者候補全員から受ける防御目標値のうち, 最も不利な値 (=牽制修正が最大にかかった値) を取得する
// 「敵の牽制による修正 (複数なら最大の修正を適用) 込みの自身の防御目標値」に対応する
export function worstOwnDefenseTarget(actor: Unit, attackers: Unit[]): number {
  if (attackers.length === 0) return actor.defense.target
  return Math.min(...attackers.map(attacker => actor.defense.getTarget(attacker, 'body')))
}

// 陣営の前衛 (left/center/right) の人数を取得する
export function getFrontAllyCount(state: State, side: Side): number {
  if (!state.formation) return 0
  const formation = side === 'player' ? state.formation.player : state.formation.enemy
  return Object.values(formation.front).filter(unit => unit !== null).length
}

// 全力攻撃オプションの選定
// 準備が必要なら「準備即攻撃」, ダメージ期待値が0点なら「ダメージ安定」,
// 攻撃目標値が10以下なら「技能値+4」, 敵の防御目標値が11以上なら「牽制即攻撃」, それ以外は「2回攻撃」
export function pickFullPowerOption(actor: Unit, target: Unit, foggy: boolean): FullPower {
  if (actor.attack.ready > 0) return 'ready'
  const dr = target.defense.getDR('body', actor.attack.model.dmgType)
  if (actor.attack.getExpectedDmg('none', dr) === 0) return 'dmg'
  if (actor.attack.getTarget('body', 'none', target, foggy) <= 10) return 'level'
  if (target.defense.getTarget(actor, 'body') >= 11) return 'feint'
  return 'double'
}
