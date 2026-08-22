// Combat/AI/handlers/heavyWarrior.ts

import { type TacticHandler } from '../handler'
import { warriorTactic, HEAVY_WARRIOR_PARAMS } from '../base/warrior'

// 重戦士, 術戦士F: 積極的に中央に移動して前衛で戦う (術は使わない) / 防御優先で慎重に戦う
// 行動パターンの詳細は base/warrior.ts の warriorTactic を参照
export const heavyWarrior: TacticHandler = (actor, state) => warriorTactic(actor, state, HEAVY_WARRIOR_PARAMS)
