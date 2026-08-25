// Combat/Enemy.ts

import { type CombatUnitModel } from './Unit'
import { makeCombatEnemyModel, makeParamsByRank } from './Enemy/Base'
import { makeGoblinFormation } from './Enemy/Goblin'
import { SLIME_SIZES, makeSlime, ALCHEMIST_UNIT_DEF } from './Enemy/Slime'

// Rank算出 (プレイヤー保有CPから0〜3を導出する. Easyのゴブリン生成に使用する)
export function getRankFromCp(cp: number): number {
  if (cp < 16) return 0
  else if (cp < 24) return 1
  else if (cp < 40) return 2
  else return 3
}

// Rank を指定して敵編成 (4体) を1つランダムに選び, 実際の CombatUnitModel[] と報酬を返す
// (id はテンプレートを編成間で使い回すため, ここで 101〜104 に振り直す)
export function getEnemyFormation(rank: number): { models: CombatUnitModel[], rewardCp: number, rewardGold: number } {
  // 4:1の割合で分岐
  const r = Math.floor(Math.random() * 5)

  if (r === 0) {
    // スライム編成
    const models = []
    // 錬金術師
    const { name, params, equips, tactic } = ALCHEMIST_UNIT_DEF
    const alchemistParams = makeParamsByRank(params, rank)
    const alchemistModel = makeCombatEnemyModel(101, name, alchemistParams, equips, tactic)
    models.push(alchemistModel)
    // スライム
    SLIME_SIZES.forEach((size, i) => {
      models.push({ ...makeSlime(size, rank), id: 102 + i })
    })

    return { models, rewardCp: 1, rewardGold: 100 }

  } else {
    // ゴブリン編成
    const formation = makeGoblinFormation()

    const models = formation.members.map((member, i) => {
      const params = makeParamsByRank(member.params, rank)
      const { name, equips, tactic } = member
      return makeCombatEnemyModel(101 + i, name, params, equips, tactic)
    })

    const { rewardCp, rewardGold } = formation

    return { models, rewardCp: rewardCp, rewardGold: rewardGold }
  }
}
