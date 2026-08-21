// Combat/AI/handlers/earthMetalSpell.ts

import { type CombatState as State } from '../../State'
import { type CombatUnit as Unit } from '../../Unit'
import { type ActionRequest } from '../../Action/types'
import { type TacticHandler } from '../handler'
import { chance, pickLowestDefenseTarget } from '../utils'

/**
 * 術士: 土行術と金行術をメインで戦う
 *
 * 1. 集中
 * 集中時間が0ターンなら, 集中
 * 50% の確率分岐でどちらかの術に集中
 * 
 * A. 土行術パターン
 * A-1. 集中時間が1ターン
 * 土行術の技能値で分岐
 * 土行術の技能値が12未満なら,「ベルセルク」
 * 土行術の技能値が16なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 土行術の技能値が12以上なら, 50% の確率分岐で「ベルセルク」か「アースハンド」
 * 
 * A-2. 集中時間が2ターン
 * 集中を継続
 * 「大地の癒し」「痛覚鈍麻」は NPC は使わない
 * 
 * A-3. 集中時間が3ターン
 * 「瓦礫の雨」
 * 「傀儡」は NPC は使わない
 * 
 * B. 金行術パターン
 * B-1. 集中時間が1ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が13未満なら,「金縛り」
 * 金行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか,「金縛り」
 * 「杯」は NPC は使わない
 * 
 * B-2. 集中時間が2ターン
 * 金行術の技能値で分岐
 * 金行術の技能値が15未満なら,「金貨」
 * 金行術の技能値が16以上なら, 50% の確率分岐で集中を継続するか,「金貨」
 * その前に「盾」が発動する可能性有り
 * 
 * B-3. 集中時間が3ターン
 * 50% の確率分岐で「サイレン」か「塔」
 */
export const earthMetalSpell: TacticHandler = (actor, state) => {
  const active = actor.spellCast.earth > 0 ? 'earth' : actor.spellCast.metal > 0 ? 'metal' : null

  // 1. 集中 (いずれの系統にも集中していなければ, 50% の確率分岐でどちらかに集中する)
  if (!active) {
    const element = chance() ? 'earth' : 'metal'
    return { key: 'cast', options: { element }, targets: [] }
  }

  return active === 'earth' ? earthPattern(actor, state) : metalPattern(actor, state)
}

// A. 土行術パターン
function earthPattern(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.earth
  const turns = actor.spellCast.earth
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'earth' }, targets: [] })
  const self = (spellId: number): ActionRequest => ({ key: 'spell', options: { element: 'earth', spellId }, targets: [actor] })
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'earth', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // A-1. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return self(0) // ベルセルク
    if (skill >= 16 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12以上のケースと同じ判定)
    return chance() ? self(0) : enemy(1) // ベルセルク / アースハンド
  }

  // A-2. 集中時間が2ターン (「大地の癒し」「痛覚鈍麻」は NPC は使わないため, 常に集中を継続する)
  if (turns === 2) return cast()

  // A-3. 集中時間が3ターン (「瓦礫の雨」.「傀儡」は NPC は使わない)
  return self(5)
}

// B. 金行術パターン
function metalPattern(actor: Unit, state: State): ActionRequest {
  const skill = actor.spells.metal
  const turns = actor.spellCast.metal
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)

  const cast = (): ActionRequest => ({ key: 'cast', options: { element: 'metal' }, targets: [] })
  const enemy = (spellId: number): ActionRequest => enemyTarget
    ? { key: 'spell', options: { element: 'metal', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // B-1. 集中時間が1ターン (「杯」は NPC は使わない)
  if (turns === 1) {
    if (skill >= 13 && chance()) return cast() // 集中継続
    return enemy(0) // 金縛り
  }

  // B-2. 集中時間が2ターン (その前に「盾」が発動する可能性有り. 発動判定自体は Action/effects.ts 側で自動的に行われる)
  if (turns === 2) {
    if (skill >= 16 && chance()) return cast() // 集中継続
    return enemy(2) // 金貨
  }

  // B-3. 集中時間が3ターン
  return chance() ? enemy(4) : enemy(5) // サイレン / 塔
}
