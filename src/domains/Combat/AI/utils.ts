// Combat/AI/utils.ts
//
// 各行動パターン (Combat/AI/handlers 配下) で共通して使う判定・選定ロジックをまとめる

import { type CombatState as State } from '../State'
import { type CombatUnit as Unit, type Side, type Position } from '../Unit'
import { type FullPower, type ActionRequest } from '../Action/types'

// 確率分岐 (デフォルトは 50%)
export function chance(probability: number = 0.5): boolean {
  return Math.random() < probability
}

// 朦朧状態・幻惑・目/耳/四肢の故障のいずれかに該当するか (「行動不能」とみなす目安. 気絶・死亡は対象選定の時点で除外済みのため含まない)
export function isIncapacitated(unit: Unit): boolean {
  return unit.health.stunned || unit.statusEffects.dazed > 0 ||
    unit.health.blinded || unit.health.deafened || unit.health.injuryOnArm || unit.health.injuryOnLeg
}

// 前衛 (position !== 'back') がいればそちらのみを候補とし, いなければ全員を候補とする (法術の対象選定用)
export function frontOrAll(candidates: Unit[]): Unit[] {
  const front = candidates.filter(unit => unit.position !== 'back')
  return front.length > 0 ? front : candidates
}

// 複数の優先条件を順に適用し, 候補を1体に絞り込む (近接/法術/射撃, 対象選定全般で共通利用する)
// 各条件 (keyFns) は数値が低いほど優先する比較キーを返す関数. 条件が同点の場合のみ次の条件で絞り込む
// 全ての条件を通して同点が残った場合 (もしくは keyFns を使い切った場合), 候補配列内で最初に出現した対象を選ぶ (候補が空なら null)
export function pickByPriority<T>(candidates: T[], ...keyFns: Array<(unit: T) => number>): T | null {
  let pool = candidates
  for (const keyFn of keyFns) {
    if (pool.length <= 1) break
    const minValue = Math.min(...pool.map(keyFn))
    pool = pool.filter(unit => keyFn(unit) === minValue)
  }
  return pool[0] ?? null
}

// 防御目標値 (自身の牽制による修正込み) が最も低い候補を選ぶ (候補が空なら null)
// 近接 (warrior.ts) / 射撃 (archer.ts) / 法術の直接攻撃対象選定で共通利用する
export function pickLowestDefenseTarget(actor: Unit, candidates: Unit[]): Unit | null {
  return pickByPriority(candidates, unit => unit.defense.getTarget(actor, 'body'))
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

// 前衛にいるが現在位置からは近接攻撃対象が0体の場合, 移動すれば対象に届く移動先を返す (届く移動先が無ければ null)
// (近接攻撃対象は自身の配置により決まる: 左翼→敵の中央/右翼, 右翼→敵の中央/左翼, 中央→敵の前衛全て.
//  前衛にいながら対象が0体になるのは, 自身が左翼/右翼にいて, かつ敵が自身と同じ翼 (鏡写しの位置) にしかいない
//  場合のみ起こりうる (中央にいる間は敵の前衛全てに届くため, この状況自体が発生しない).
//  この場合, 中央だけでなく反対の翼 (左翼↔右翼) に移動しても対象に届くため, 中央が塞がっている等で移動できない
//  場合に備え, 優先順位を 1.中央, 2.反対の翼 として, 実際に移動可能な方を選ぶ.
//  前衛に敵が1人もいない (残りが全員後方にいる) 場合は, どこに移動しても対象は増えないため null を返す)
export function pickMoveToReachMeleeTarget(actor: Unit, state: State): Position | null {
  const action = state.action!
  if (action.target.melee.length > 0) return null
  if (actor.position === 'back' || actor.position === 'center') return null
  if (!action.target.enemies.some(enemy => enemy.position !== 'back')) return null

  const opposite: Position = actor.position === 'left' ? 'right' : 'left'
  const candidates: Position[] = ['center', opposite]
  return candidates.find(position => action.availability.move[position]) ?? null
}

// 狂戦士状態で, 現在の配置からは近接攻撃可能な相手が誰もおらず, 移動によっても解消できない場合に true を返す
// (後衛にいる場合は, いずれかの前衛枠に移動できるなら stuck とはみなさない (移動そのものが今ターンの行動になる).
//  前衛にいる場合は, 現在の近接対象が0体で, かつ移動しても対象に届く位置が無い場合のみ stuck とみなす)
// 狂戦士状態では通常攻撃・全力防御・牽制が選択不可であり, 特殊攻撃は近接対象を要するため,
// これに該当すると (プレイヤー・NPC を問わず) 選択可能な行動が実質的に無くなる
export function isBerserkStuck(actor: Unit, state: State): boolean {
  if (!actor.statusEffects.berserk) return false
  const action = state.action!
  if (actor.position === 'back') {
    return (['left', 'center', 'right'] as const).every(position => !action.availability.move[position])
  }
  if (action.target.melee.length > 0) return false
  return pickMoveToReachMeleeTarget(actor, state) === null
}

// 攻撃オプションの選定
// WarriorParams によって, 一定確率で速攻(全力攻撃)を実行
export function pickAttackOption(actor: Unit, state: State, target: Unit, quickAttack: number): ActionRequest {
  if (chance(quickAttack)) {
    return { key: 'attack', options: { aim: 'body', fullPower: pickFullPowerOption(actor, target, state.shootPenalty[actor.side]) }, targets: [target] }
  } else {
    return { key: 'attack', options: { aim: 'body', fullPower: 'none' }, targets: [target] }
  }
}

// 全力攻撃オプションの選定
// 準備が必要なら「準備即攻撃」, ダメージ期待値が0点なら「ダメージ安定」,
// 攻撃目標値が10以下なら「技能値+4」, 敵の防御目標値が11以上なら「牽制即攻撃」, それ以外は「2回攻撃」
export function pickFullPowerOption(actor: Unit, target: Unit, shootPenalty: boolean): FullPower {
  if (actor.attack.ready > 0) return 'ready'
  const dr = target.defense.getDR('body', actor.attack.model.dmgType)
  if (actor.attack.getExpectedDmg('none', dr, target.defense.creatureType) === 0) return 'dmg'
  if (actor.attack.getTarget('body', 'none', target, shootPenalty) <= 10) return 'level'
  if (target.defense.getTarget(actor, 'body') >= 11) return 'feint'
  return 'double'
}
