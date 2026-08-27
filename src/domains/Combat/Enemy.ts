// Combat/Enemy.ts

import { type BattleDifficultyTier } from './Difficulty'
import { type SaveData } from '../SaveData'
import { createSamples } from '../Sample/Character'
import { type CombatUnitModel } from './Unit'
import { makeCombatEnemyModel, makeParamsByRank } from './Enemy/Base'
import { SLIME_SIZES, makeSlime, ALCHEMIST_UNIT_DEF } from './Enemy/Slime'
import { makeGoblinFormation } from './Enemy/Goblin'
import { makeUndeadFormation } from './Enemy/Undead'

// Normal難度: 敵の生成CPの倍率下限・上限 (プレイヤーCP比)
const NORMAL_CP_MULTIPLIER_MIN = 1
const NORMAL_CP_MULTIPLIER_MAX = 1.25
// Normal (および現状Normal相当にフォールバックしているHard) 勝利時の固定CP報酬・Gold報酬
const NORMAL_REWARD_CP = 2
const NORMAL_REWARD_GOLD = 200

// Rank算出 (プレイヤー保有CPから0〜5を導出する. Easyのゴブリン生成に使用する)
export function getRankFromCp(cp: number): number {
  if (cp < 16) return 0
  else if (cp < 24) return 1
  else if (cp < 40) return 2
  else if (cp < 56) return 3
  else if (cp < 72) return 4
  else return 5
}

// Rank を指定して敵編成 (4体) を1つランダムに選び, 実際の CombatUnitModel[] と報酬を返す
// (id はテンプレートを編成間で使い回すため, ここで 101〜104 に振り直す)
// easy/hard (テンプレートベースの敵編成) 専用. normal (人間NPCとの戦闘) は getEnemyBattleSetup を参照
export function getEnemyFormation(difficulty: BattleDifficultyTier | undefined, rank: number): { models: CombatUnitModel[], rewardCp: number, rewardGold: number } {
  if (!difficulty || difficulty === 'easy') {
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
  } else {
    // アンデッド編成
    const formation = makeUndeadFormation()

    const models = formation.members.map((member, i) => {
      const params = makeParamsByRank(member.params, rank)
      const { name, equips, tactic } = member
      return makeCombatEnemyModel(101 + i, name, params, equips, tactic)
    })

    const { rewardCp, rewardGold } = formation

    return { models, rewardCp: rewardCp, rewardGold: rewardGold }
  }
}

// 難度に応じた敵4人の出撃ユニットと, その勝利報酬を用意する
// (難度ごとの敵生成方式の分岐を一元的に管理する. Combat.tsx からはこの関数のみを呼び出せばよい)
export function getEnemyBattleSetup(difficulty: BattleDifficultyTier | undefined, saveData: SaveData): { models: CombatUnitModel[], reward: { cp: number, gold: number } } {
  // Easy または難度未指定 (state 消失時のフォールバック) の場合:
  // ゴブリン編成 (Rank はプレイヤー保有CPから算出). 報酬は編成ごとに定義された値を使用する
  // Hardの場合:
  // アンデッド編成 (Rank はプレイヤー保有CPから算出). 報酬は固定で, CP: 4, Gold: 400 とする
  if (!difficulty || difficulty === 'easy' || difficulty === 'hard') {
    const rank = getRankFromCp(saveData.loadPoints())
    const formation = getEnemyFormation(difficulty, rank)
    return { models: formation.models, reward: { cp: formation.rewardCp, gold: formation.rewardGold } }
  }

  // Normalの場合: 従来通りサンプル (人間) を生成する.
  // 生成CPは, プレイヤーの実際のCPの1.0〜1.25倍 (戦闘開始のたびにランダムに再抽選) とする.
  // 報酬は, CPは固定値 (2), Goldは200 * CP倍率 とする.
  //
  // 初期仲間 (ゲーム開始時に自動生成される仲間セット) の生成に使った乱数と重複すると,
  // 同じ顔ぶれの NPC が敵として出現してしまうため, それを避けて抽選する
  const excludedMod = saveData.loadInitialMod()
  let r2 = Math.floor(Math.random() * 16)
  while (r2 === excludedMod) {
    r2 = Math.floor(Math.random() * 16)
  }
  const cpMultiplier = NORMAL_CP_MULTIPLIER_MIN + Math.random() * (NORMAL_CP_MULTIPLIER_MAX - NORMAL_CP_MULTIPLIER_MIN)
  const enemyCp = Math.round(Math.floor(saveData.loadPoints() * cpMultiplier))
  // 能力値のスケーリング (CP倍率) は選択された初期CP (10/20/40) にあわせたセーブデータの値を使用する
  const models = createSamples(enemyCp, saveData.loadMultiplier(), 4, r2, 4).map(unit => unit.combatUnitModel)
  return { models, reward: { cp: NORMAL_REWARD_CP, gold: Math.floor(NORMAL_REWARD_GOLD * cpMultiplier) } }
}
