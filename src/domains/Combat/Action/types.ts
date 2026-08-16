// Combat/Action/types.ts

import { type ArmorSlotKey } from '../../Equipments'
import { type Position, type CombatUnit as Unit } from '../Unit'
import { type Judge } from '../Dice'

export const ACTION_KEYS = ['attack', 'move', 'wait'] as const

export const ACTION_LABELS: Record<ActionKey, string> = {
  attack: '攻撃',
  move: '移動',
  wait: '待機'
} as const

export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

export const FULL_POWER_KEYS = ['none', 'dmg', 'level', 'feint', 'double'] as const

export const FULL_POWER_OPTIONS: Record<FullPower, { label: string }> = {
  none: { label: '通常攻撃' },
  dmg: { label: 'ダメージ安定' },
  level: { label: '技能値+4' },
  feint: { label: '牽制即攻撃' },
  double: { label: '2回攻撃' }
} as const

export const AIM_KEYS = ['head', 'ear', 'eye', 'body', 'neck', 'stomach', 'arm', 'hand', 'leg', 'foot'] as const

export const AIM_OPTIONS: Record<Aim, { label: string, group: ArmorSlotKey, mod: number }> = {
  head: { label: '頭', group: 'head', mod: -3 }, 
  ear: { label: '耳', group: 'head', mod: -5 },
  eye: { label: '目', group: 'head', mod: -7 },
  body: { label: '体', group: 'body', mod: 0 },
  neck: { label: '喉', group: 'body', mod: -5 },
  stomach: { label: '肚', group: 'body', mod: -3 },
  arm: { label: '腕', group: 'arm', mod: -2 },
  hand: { label: '手首', group: 'arm', mod: -4 },
  leg: { label: '脚', group: 'leg', mod: -2 },
  foot: { label: '足首', group: 'leg', mod: -4 }
} as const

// 行動キー
export type ActionKey = typeof ACTION_KEYS[number]

// 全力攻撃オプション
export type FullPower = typeof FULL_POWER_KEYS[number]

// 部位狙いオプション
export type Aim = typeof AIM_KEYS[number]

// 行動オプション
export type ActionOptions = {
  aim?: Aim
  fullPower?: FullPower
  position?: Position
}

// 行動キーとオプションの組み合わせ
// targets は「攻撃」等, ターゲット選択を伴う行動のみ空でない配列になる
export type ActionRequest =
  | { key: 'attack', options: { aim: Aim, fullPower: FullPower }, targets: [Unit] }
  | { key: 'move', options: { position: Position }, targets: [] }
  | { key: 'wait', options: {}, targets: [] }

// 防御種別
export type DefenseType = 'parry' | 'block' | 'dodge'

// 攻撃判定結果
export type AttackResult = Judge & {
  aim: Aim
  fullPower: FullPower
}

// 防御判定結果
export type DefenseResult = Judge & {
  defenseType: DefenseType
}

// ダメージ判定結果
export type DmgResult = Judge

// 行動実行後の判定結果の定義
export type ActionResult =
  | { type: 'attack', judge: AttackResult }
  | { type: 'defense', judge: DefenseResult }
  | { type: 'dmg', judge: DmgResult }
  | { type: 'knockedDown', judge: Judge }
  | { type: 'fatal', judge: Judge }
