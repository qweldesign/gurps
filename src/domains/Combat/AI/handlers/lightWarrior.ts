// Combat/AI/handlers/lightWarrior.ts

import { type TacticHandler } from '../handler'
import { warriorTactic, LIGHT_WARRIOR_PARAMS } from '../base/warrior'

// 軽戦士, 剣士, 盗賊: 積極的に左翼・右翼に移動して前衛で戦う / 攻撃優先で大胆に戦う
// (弓使い・術系統各系統の狂戦士状態時の行動パターンとしても使われる)
// 行動パターンの詳細は base/warrior.ts の warriorTactic を参照
export const lightWarrior: TacticHandler = (actor, state) => warriorTactic(actor, state, LIGHT_WARRIOR_PARAMS)
