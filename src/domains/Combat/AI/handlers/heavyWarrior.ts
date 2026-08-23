// Combat/AI/handlers/heavyWarrior.ts

import { type TacticHandler } from '../handler'
import { warriorTactic } from '../base/warrior'

// 重戦士, 術戦士F: 積極的に中央に移動して前衛で戦う (術は使わない) / 防御優先
// 行動パターンの詳細は base/warrior.ts の warriorTactic を参照
export const heavyWarrior: TacticHandler = (actor, state, difficulity) => warriorTactic(actor, state, true, difficulity)
