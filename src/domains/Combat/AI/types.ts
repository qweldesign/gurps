// Combat/AI/types.ts

// 敵 (NPC) の自動行動タイプ
// SampleCharacter.tactic (0~8, 技能修得・装備選択にも使う既存のロジックタイプ) にそのまま対応する
//
// 新しいタイプを追加する場合は, ここにキーを追加した上で, AI/index.ts の TACTIC_HANDLERS に
// ハンドラーを登録する (複数のタイプが同じハンドラーを共有してもよい)
export const TACTIC_KEYS = [
  'heavyWarrior',   // 重戦士
  'lightWarrior',   // 軽戦士
  'spellWarriorF',  // 術戦士F
  'swordsman',      // 剣士
  'thief',          // 盗賊
  'archer',         // 弓使い
  'spellWarriorB',  // 術戦士B
  'spellSwordsman', // 術剣士
  'sorcerer'        // 術士
] as const

export type TacticKey = typeof TACTIC_KEYS[number]
