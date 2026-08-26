// Combat/Player.ts

import { Character } from '../Character'
import { createSamples } from '../Sample/Character'
import { type SaveData } from '../SaveData'
import { type CombatUnitModel } from './Unit'

const SLOT_SIZE = 4 // プレイヤー側の出撃人数 (Setup/Select と共通)
const DEFAULT_CP = 10 // ランダム生成時のデフォルトCP (プレイヤー側フォールバック用)

// プレイヤー4人の出撃ユニットを用意する
// Setup で選出された出撃メンバー (4名) があればそれを使用し, 無ければ従来通りサンプルにフォールバックする
// usedRoster: セーブデータ上の実在キャラクターを使用したかどうか (フォールバック時は false)
export function getPlayerBattleSetup(saveData: SaveData): { models: CombatUnitModel[], usedRoster: boolean } {
  const memberIds = saveData.loadBattleMembers()
  if (memberIds.length === SLOT_SIZE) {
    const characters = memberIds.map(id => new Character(saveData.loadModel(String(id).padStart(2, '0'))))
    // 除名等で id 0 (未設定) が混ざっていなければ, 選出メンバーとして採用
    if (characters.every(character => character.id !== 0)) {
      return { models: characters.map(character => character.combatUnitModel), usedRoster: true }
    }
  }
  // フォールバック: 従来通りのランダムサンプル
  // CP倍率は選択された初期CP (10/20/40) にあわせたセーブデータの値を使用する
  const r1 = Math.floor(Math.random() * 16)
  const models = createSamples(DEFAULT_CP, saveData.loadMultiplier(), SLOT_SIZE, r1, 0).map(unit => unit.combatUnitModel)
  return { models, usedRoster: false }
}
