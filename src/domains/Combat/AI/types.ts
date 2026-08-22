// Combat/AI/types.ts

// 敵 (NPC) の自動行動タイプ
// SampleCharacter.tactic に対応する (それ以外の新しいタイプを追加することも可能)
//
// 新しいタイプを追加する場合は, ここにキーを追加した上で,
// AI/index.ts の TACTIC_HANDLERS にハンドラーを登録する
export const TACTIC_KEYS = [
  'heavyWarrior',   // 重戦士
  'lightWarrior',   // 軽戦士
  'archer',         // 弓使い
  'fireSpell',      // 火行術戦士
  'woodWaterSpell', // 木行/水行術士
  'earthMetalSpell' // 土行/金行術士
] as const

export type TacticKey = typeof TACTIC_KEYS[number]
