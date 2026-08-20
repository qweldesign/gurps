// Combat/Enemy.ts
//
// 敵編成データ (このファイルだけを編集すれば, 戦闘の敵メンバーを差し替えられる)

import { type CombatUnitModel } from './Unit'

// SLOT_SIZE (4) 体分の CombatUnitModel を書けば, その内容がそのまま戦闘の敵メンバーになる
// 4体揃っていない (デフォルトは空配列) 場合は, 従来通りランダム生成した敵が使われる (Combat.tsx 側の initEnemyModels を参照)
//
// tactic (省略可) に自動行動タイプを指定すると, そのユニットは対応する行動パターン (Combat/AI/handlers 配下) で
// 自動行動する (未指定の場合は自動行動せず, プレイヤーが手動操作するユニットとして扱われる)
// 指定できる値は Combat/AI/types.ts の TACTIC_KEYS を参照 (現在は以下の9種):
//   heavyWarrior(重戦士) / lightWarrior(軽戦士) / spellWarriorF(術戦士F) / swordsman(剣士) / thief(盗賊) /
//   archer(弓使い) / spellWarriorB(術戦士B) / spellSwordsman(術剣士) / sorcerer(術士)
//
// 例:
// export const enemy: CombatUnitModel[] = [
//   { id: 101, name: 'ゴブリン', maxHp: 12, attacks: {...}, defenses: {...}, ev: 8, pre: 11, mre: 10,
//     dmgBuff: 0, evBuff: 0, spells: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }, tactic: 'lightWarrior' },
//   ...
// ]
//
// 【将来の拡張ポイント】「敵を倒すと CP を獲得し, 味方が成長する一方で敵も強くなる」といった
// ループを実装する場合:
//   - 撃破の検知には CombatState.result === 'win' が使える (勝敗判定は実装済み)
//   - 「味方の成長」は Setup 側のセーブデータ (SaveData.savePoints/saveGold 等) と連携し,
//     戦闘終了後に加算する形で実装できる
//   - 「敵の強化」は, この配列を固定値ではなく「周回数・撃破数に応じた編成を返す関数」に
//     差し替えることで対応できる (例: createEnemy(waveCount) のような形)
export const enemy: CombatUnitModel[] = []
