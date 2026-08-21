// Combat/AI/handler.ts

import { type CombatState as State } from '../State'
import { type CombatUnit as Unit } from '../Unit'
import { type ActionRequest } from '../Action/types'

// 敵 (NPC) の行動決定関数
// actor (自分自身) と state (戦闘全体の状態) を受け取り, 今ターンの行動 (ActionRequest) を1つ返す
// 実行可否判定は state.action.availability, 対象選定は state.action.target / state.formation を参照する
export type TacticHandler = (actor: Unit, state: State) => ActionRequest
