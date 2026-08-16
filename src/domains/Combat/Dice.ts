// Combat/Dice.ts

// ロール定義
export type Roll = {
  roll: number // 出目
}

// 判定定義
export type Judge = Roll & {
  success: boolean // 成功/失敗
  critical: boolean // クリティカル/ファンブル
}

// 成功度定義
export type Score = Roll & {
  success: boolean
  score: number // 成功度
}

// ロール結果 (Roll型) を返す
export function roll(count: number = 3, mod: number = 0, sides: number = 6): Roll {
  const roll = getRoll(count, mod, sides)
  return { roll }
}

// 判定結果 (Judge型) を返す
export function judge(target: number): Judge {
  const roll = getRoll()
  const criticalTarget = Math.max(4, Math.min((target - 10), 6)) // クリティカル
  const fumbleTarget = Math.max(17, Math.min((target + 1), 18)) // ファンブル
  const success = roll <= criticalTarget || (roll <= target && roll < 17)
  const critical = roll <= criticalTarget || roll >= fumbleTarget
  return { roll, success, critical }
}

// 成功度結果 (Score型) を返す
export function score(target: number): Score {
  const roll = getRoll()
  const success = roll < target
  const score = target - roll
  return { roll, success, score}
}

// ダイスを振った出目を取得
function getRoll(count: number = 3, mod: number = 0, sides: number = 6): number {
  return Array.from<number>({ length: count }).reduce(sum => {
    return sum + Math.ceil(Math.random() * sides)
  }, 0) + mod
}
