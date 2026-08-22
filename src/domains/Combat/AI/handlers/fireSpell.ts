// Combat/AI/handlers/fireSpell.ts

import { type TacticHandler } from '../handler'
import { lightWarrior } from './lightWarrior'
import { chance, getFrontAllyCount, pickLowestDefenseTarget } from '../utils'

/**
 * 術戦士B: 火行術をメインで戦う / 前衛の味方が1人になったら前衛に出て「軽戦士」として応戦する
 *
 * 0-a. 狂戦士状態
 * 前に出て近接戦闘を行うのが狂戦士状態でのセオリーのため, 「軽戦士」として振る舞う
 *
 * 0-b. 移動 (狂戦士状態の解除後)
 * 狂戦士状態が解除されても前衛に出たままなら, 後衛へ戻る (canMove('back') は狂戦士状態でなければ常に可能)
 *
 * 1. 移動
 * 2ターン目以降, 前衛の味方が1人になった場合は前衛に移動し, 「軽戦士」として戦う
 * (一度前衛に出たら, 以降のターンもずっと「軽戦士」として振る舞う)
 *
 * 2. 集中
 * 集中時間が0ターンなら, 集中
 *
 * 3. 集中時間が1ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が12未満なら,「ヒロイズム」
 * 火行術の技能値が13以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 火行術の技能値が12なら, 50% の確率分岐で「ヒロイズム」か「閃光」
 *
 * 4. 集中時間が2ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が14未満なら,「火球」
 * 火行術の技能値が15以上なら, 50% の確率分岐で集中を継続するか, 次と同じ
 * 火行術の技能値が14なら,「炎の嵐」
 *
 * 5. 集中時間が3ターン
 * 火行術の技能値で分岐
 * 火行術の技能値が16未満なら,「火の鳥」
 * 火行術の技能値が16以上なら, 50% の確率分岐で「火の鳥」か「焼殺」
 */
export const fireSpell: TacticHandler = (actor, state) => {
  // 0-a. 狂戦士状態 (術戦士Bの武器は近接戦闘に使えるため, 持ち替え不要でそのまま委譲できる)
  if (actor.statusEffects.berserk) return lightWarrior(actor, state)

  // 0-b. 狂戦士状態の解除後: 前衛に出たままなら後衛へ戻る
  if (actor.position !== 'back') {
    const { availability } = state.action!
    if (availability.move.back) return { key: 'move', options: { position: 'back' }, targets: [] }
    // 後衛へ戻れない間 (幻惑状態等) は, 引き続き「軽戦士」として応戦する
    return lightWarrior(actor, state)
  }

  // 1. 移動 (一度前衛に出たら, 以降はずっと lightWarrior に委譲する)
  if (actor.position !== 'back') return lightWarrior(actor, state)
  if (state.round >= 2 && getFrontAllyCount(state, actor.side) === 1) return lightWarrior(actor, state)

  const skill = actor.spells.fire
  const turns = actor.spellCast.fire

  // 2. 集中
  if (turns === 0) return { key: 'cast', options: { element: 'fire' }, targets: [] }

  const cast = (): ReturnType<TacticHandler> => ({ key: 'cast', options: { element: 'fire' }, targets: [] })
  const self = (spellId: number): ReturnType<TacticHandler> => ({ key: 'spell', options: { element: 'fire', spellId }, targets: [actor] })
  const enemyTarget = pickLowestDefenseTarget(actor, state.action!.target.enemies)
  const enemy = (spellId: number): ReturnType<TacticHandler> => enemyTarget
    ? { key: 'spell', options: { element: 'fire', spellId }, targets: [enemyTarget] }
    : { key: 'wait', options: {}, targets: [] }

  // 3. 集中時間が1ターン
  if (turns === 1) {
    if (skill < 12) return self(0) // ヒロイズム
    if (skill >= 13 && chance()) return cast() // 集中継続
    // 次と同じ (技能値12のケースと同じ判定)
    return chance() ? self(0) : self(1) // ヒロイズム / 閃光 (対象を持たない術のため暫定的に自身を対象とする)
  }

  // 4. 集中時間が2ターン
  if (turns === 2) {
    if (skill < 14) return enemy(2) // 火球
    if (skill >= 15 && chance()) return cast() // 集中継続
    return self(3) // 炎の嵐 (次と同じ = 技能値14のケース. 対象を持たない術のため暫定的に自身を対象とする)
  }

  // 5. 集中時間が3ターン
  if (skill < 16) return self(4) // 火の鳥
  return chance() ? self(4) : enemy(5) // 火の鳥 / 焼殺
}
