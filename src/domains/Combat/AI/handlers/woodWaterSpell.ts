// Combat/AI/handlers/woodWaterSpell.ts

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { type TacticHandler } from '../handler'
import { lightWarrior } from './lightWarrior'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 術剣士: 木行術と水行術をメインで戦う
 *
 * 0. 狂戦士状態
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 * 水行術の技能値が12以上か未満かで分岐
 * 水行術の技能値が12未満なら, 木行術に集中
 * 水行術の技能値が12以上なら, 50% の確率分岐でどちらかの術に集中
 * 
 * A. 木行術パターン
 * A-1. 集中時間が1ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が12未満なら,「ヘイスト」
 * 木行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 木行術の技能値が12なら, 50% の確率分岐で「ヘイスト」か「茨の呪縛」
 * 
 * A-2. 集中時間が2ターン
 * 木行術の技能値で分岐
 * 木行術の技能値が14未満なら,「風の刃」
 * 木行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 木行術の技能値が14か15なら, 50% の確率分岐で「風の刃」か「サイレンス」
 * 
 * A-3. 集中時間が3ターン
 * 「召雷」
 * 「リストレーション」は NPC は使わない
 * 
 * B. 水行術パターン
 * B-1. 集中時間が1ターン
 * 水行術の技能値で分岐
 * 水行術の技能値が12なら,「ぼんやり」
 * 水行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか,「ぼんやり」
 * 「生命の雫」は NPC は使わない
 * 
 * B-2. 集中時間が2ターン
 * 水行術の技能値で分岐
 * 水行術の技能値が16未満なら,「水舞」
 * 水行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか,「水舞」
 * 「濃霧」は NPC は使わない
 * 
 * B-3. 集中時間が3ターン
 * 「吹雪」/ その前に「時間遡行」が発動する可能性有り
 */
export const woodWaterSpell: TacticHandler = (actor, state) => {
  // 0. 狂戦士状態 (術剣士の武器は近接戦闘に使えるため, 持ち替え不要でそのまま委譲できる)
  if (actor.statusEffects.berserk) return lightWarrior(actor, state)

  const active = actor.spellCast.wood > 0 ? 'wood' : actor.spellCast.water > 0 ? 'water' : null

  // 1. 集中 (いずれの系統にも集中していなければ, 新たにどちらへ集中するか決める)
  if (!active) {
    const skill = actor.spells.water
    const element = skill >= 12 && chance() ? 'water' : 'wood'
    return { key: 'cast', options: { element }, targets: [] }
  }

  return active === 'wood' ? woodPattern(actor, state) : waterPattern(actor, state)
}

// A. 木行術パターン
function woodPattern(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.wood
  const turns = actor.spellCast.wood
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'wood' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'wood', spellId }, targets: [actor] })
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'wood', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // A-1. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return self(0) // ヘイスト
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? self(0) : enemy(1) // ヘイスト / 茨の呪縛
  }

  // A-2. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return enemy(2) // 風の刃
    if (skill >= 16 && chance()) return cast() // 集中継続
    // 次と同じ (技能値14か15のケースと同じ判定)
    return chance() ? enemy(2) : enemy(3) // 風の刃 / サイレンス
  }

  // A-3. 集中時間が3ターン (「召雷」.「リストレーション」は NPC は使わない)
  return enemy(5)
}

// B. 水行術パターン
function waterPattern(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.water
  const turns = actor.spellCast.water
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'water' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'water', spellId }, targets: [actor] })
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'water', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // B-1. 集中時間が1ターン (「生命の雫」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance()) return cast() // 集中継続
    return enemy(1) // ぼんやり
  }

  // B-2. 集中時間が2ターン (「濃霧」は NPC は使わない)
  if (turns === 2) {
    if (skill >= 16 && chance()) return cast() // 集中継続
    return self(2) // 水舞
  }

  // B-3. 集中時間が3ターン (「吹雪」. その前に「時間遡行」が発動する可能性有り)
  return self(5)
}
