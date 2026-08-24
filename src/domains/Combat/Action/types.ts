// Combat/Action/types.ts

import { type WeaponSlotKey, type ArmorSlotKey } from '../../Equipments'
import { type Position, type Posture, type CombatUnit as Unit } from '../Unit'
import { type Judge, type Score } from '../Dice'
import { type SpellElement, type SpellBuffTarget, type StatusEffectTarget } from '../Spells'

export const ACTION_KEYS = ['ready', 'attack', 'feint', 'shoot', 'snipe', 'cast', 'spell', 'defense', 'move', 'changeWeapon', 'changePosture', 'recovery', 'extinguish', 'wait'] as const

export const ACTION_LABELS: Record<ActionKey, string> = {
  ready: '準備',
  attack: '攻撃',
  feint: '牽制',
  shoot: '射撃',
  snipe: '狙い',
  cast: '集中',
  spell: '法術',
  defense: '全力防御',
  move: '移動',
  changeWeapon: '装備変更',
  changePosture: '姿勢変更',
  recovery: '回復',
  extinguish: '消火', // 火だるま状態のユニットのターン開始時に自動実行される (「回復」と同様, プレイヤーが選択する行動ではない)
  wait: '待機'
} as const

export const POSITION_LABELS: Record<Position, string> = {
  back: '後方',
  left: '左翼',
  center: '中央',
  right: '右翼'
} as const

export const FULL_POWER_KEYS = ['none', 'dmg', 'level', 'feint', 'double', 'ready'] as const

export const FULL_POWER_OPTIONS: Record<FullPower, { label: string }> = {
  none: { label: '通常攻撃' },
  dmg: { label: 'ダメージ安定' },
  level: { label: '技能値+4' },
  feint: { label: '牽制即攻撃' },
  double: { label: '2回攻撃' },
  ready: { label: '準備即攻撃' } // 引き戻しが必要な武器で,「2回攻撃」の代わりに選択できる (非準備状態のまま全力攻撃を行う)
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
  element?: SpellElement
  spellId?: number
  position?: Position
  posture?: Posture
  weaponSlotKey?: WeaponSlotKey
}

// 行動キーとオプションの組み合わせ
// targets は「攻撃」等, ターゲット選択を伴う行動のみ空でない配列になる
// 「集中」は詠唱時間を蓄積するだけの行動のためターゲットを取らない
// 「法術」はバフ系のみ対象 (自身 or 味方) を要するため targets: [Unit] を持つ. 対象を持たない術は暫定的に自身を対象とする
// (shoot/range 系統の術など, 敵を対象に取るものを実装する段階で, 対象選択の分岐をさらに広げる)
export type ActionRequest =
  | { key: 'ready', options: {}, targets: [] }
  | { key: 'attack', options: { aim: Aim, fullPower: FullPower }, targets: [Unit] }
  | { key: 'feint', options: {}, targets: [Unit] }
  | { key: 'shoot', options: { aim: Aim }, targets: [Unit] }
  | { key: 'snipe', options: {}, targets: [Unit] }
  | { key: 'cast', options: { element: SpellElement }, targets: [] }
  | { key: 'spell', options: { element: SpellElement, spellId: number }, targets: [Unit] }
  | { key: 'defense', options: {}, targets: [] }
  | { key: 'move', options: { position: Position }, targets: [] }
  | { key: 'changeWeapon', options: { weaponSlotKey: WeaponSlotKey }, targets: [] }
  | { key: 'changePosture', options: { posture: Posture }, targets: [] }
  | { key: 'recovery', options: {}, targets: [] }
  | { key: 'extinguish', options: {}, targets: [] }
  | { key: 'wait', options: {}, targets: [] }

// 防御種別
export type DefenseType = 'parry' | 'block' | 'dodge'

// 攻撃判定結果
export type AttackResult = Judge & {
  aim: Aim
  fullPower: FullPower
  ready: boolean // 攻撃後の武器の準備状態 (false: 非準備状態になった)
}

// 防御判定結果
export type DefenseResult = Judge & {
  defenseType: DefenseType
  ready: boolean // 防御後の武器の準備状態 (「受け」のみ変化しうる. 「止め」「よけ」は常に true)
  target?: Unit // 範囲呪文など, 単一対象前提の request.targets[0] では特定できない場合にのみ設定する (ログ表示用)
}

// 「盾」の発動結果 (金行術. 通常の防御試行回数とは別枠の追加防御. target を直接持つ (防御試行回数を消費しないため, 通常の DefenseResult とは別の結果型とする))
export type ShieldResult = Judge & {
  target: Unit
}

// ダメージ判定結果
export type DmgResult = Judge & {
  target?: Unit // 範囲呪文など, 単一対象前提の request.targets[0] では特定できない場合にのみ設定する (ログ表示用. resolveDamage の対象を常に埋める)
}

// 牽制の判定結果 (成功度: 相手の防御目標値をこの分だけ下げる)
export type FeintResult = Score & {
  target: Unit
}

// 法術の効果適用結果 (buff・status・puppet は発動成功時に無条件適用されるため常に成功, debuff は抵抗判定の成否による)
// fog は対象を持たない (戦場全体への持続効果. 「濃霧」用)
export type SpellEffectResult =
  | { kind: 'buff', target: SpellBuffTarget }
  | { kind: 'status', target: StatusEffectTarget }
  | { kind: 'debuff', target: StatusEffectTarget, applied: boolean }
  | { kind: 'puppet', target: Unit } // 「傀儡」の発動結果 (成功時, 対象のターンへその場で即座に移行する. Action.execute 参照)
  | { kind: 'fog' }

// 法術の判定結果 (発動した術の名称と, 発動成功時に適用された効果の一覧を持つ)
export type SpellResult = Judge & {
  spell: string
  effectResults: SpellEffectResult[]
}

// 精神集中の強制解除結果 (「集中」を継続していた場合のみ生成される)
// 呼び出し元によって判定を伴う場合 (防御を試みた際の維持判定失敗) と伴わない場合 (転倒時) がある
// (「集中」「法術」以外のコマンド実行による中断はプレイヤー自身の選択のためログを出さず, この結果自体を生成しない)
// target を直接持つ (対象自身が起点だが, 文脈に依存せず特定できるよう明示的に持たせる)
export type CastCanceledResult = {
  target: Unit
  element: SpellElement
}

// 頭・四肢の故障結果 (判定は伴わず, 部位のみを持つ)
export type InjuryOnLimbResult = {
  limb: Aim
}

// 射撃武器の準備の中断結果 (判定は伴わず, 巻き戻った武器名のみを持つ)
export type ReadyInterruptResult = {
  weaponName: string
}

// 狙いの中断結果 (判定は伴わない.「狙い」由来の持ち越しが破棄されたことを示すのみ)
export type AimInterruptResult = {
  source: 'snipe'
}

// 術の範囲デバフ効果の適用結果 (「閃光」用. 回避判定に失敗した対象にのみ生成される. target を直接持つ (範囲呪文は複数対象のため request.targets[0] を使えない))
export type FlashResult = Judge & {
  target: Unit
}

// 回復呪文の効果適用結果 (「大地の癒し」「杯」「生命の雫」用. 判定は伴わない. target を直接持つ (単一対象呪文だが flash/cleanse との扱いを揃える))
export type HealResult = {
  target: Unit
  applied: boolean // false: 対象・術ごとの使用回数上限に達しており, 発動はしたが効果を得られなかった
  healedAmount: number // 実際に軽減された負傷量 (キャップ済み)
  curedStun: boolean
  curedLimbInjury: boolean
}

// 術の範囲浄化効果の適用結果 (「リストレーション」用. 判定を伴わず, 何か1つでも治癒した対象にのみ生成される. target を直接持つ (範囲呪文のため複数対象))
export type CleanseResult = {
  target: Unit
  curedStun: boolean
  curedDazed: boolean
  curedBerserk: boolean
  curedPanic: boolean
}

// 術の範囲デバフ効果の判定結果 (「サイレン」用. 抵抗判定 (Score) に失敗した対象にのみ生成される. target を直接持つ (範囲呪文のため複数対象))
export type DebuffAllResult = Score & {
  target: Unit
  statusTarget: StatusEffectTarget // 付与された状態異常 (ログのラベル表示用)
}

// 行動実行後の判定結果の定義
export type ActionResult =
  | { type: 'attack', judge: AttackResult }
  | { type: 'defense', judge: DefenseResult }
  | { type: 'shield', judge: ShieldResult } // 術「盾」の発動判定結果 (通常の防御試行回数とは別枠の追加防御. 成否を問わず精神集中(金)をリセットする)
  | { type: 'dmg', judge: DmgResult }
  | { type: 'feint', judge: FeintResult }
  | { type: 'cast', judge: Judge }
  | { type: 'spell', judge: SpellResult }
  | { type: 'trip', judge: Judge } // 術の転倒効果の判定結果 (「アースハンド」用. 成功: 転倒を免れる, 失敗: 転倒する)
  | { type: 'flash', judge: FlashResult } // 術の範囲デバフ効果の判定結果 (「閃光」用. 回避判定に失敗した対象にのみ生成される)
  | { type: 'heal', judge: HealResult } // 回復呪文の効果適用結果 (「大地の癒し」「杯」「生命の雫」用)
  | { type: 'cleanse', judge: CleanseResult } // 術の範囲浄化効果の適用結果 (「リストレーション」用. 何か1つでも治癒した対象にのみ生成される)
  | { type: 'debuffAll', judge: DebuffAllResult } // 術の範囲デバフ効果の判定結果 (「サイレン」用. 抵抗判定に失敗した対象にのみ生成される)
  | { type: 'recovery', judge: Judge }
  | { type: 'castCanceled', judge: CastCanceledResult } // 精神集中の強制解除 (「集中」を継続していた場合のみ生成される. 転倒・防御を試みた際の維持判定失敗のいずれかに起因する)
  | { type: 'injuryOnLimb', judge: InjuryOnLimbResult }
  | { type: 'knockedDown', judge: Judge }
  | { type: 'fatal', judge: Judge }
  | { type: 'unconscious', judge: Judge }
  | { type: 'dead', judge: Judge }
  | { type: 'readyInterrupted', judge: ReadyInterruptResult } // 防御を試みたことによる, 射撃武器の準備の中断
  | { type: 'aimInterrupted', judge: AimInterruptResult } // 防御を試みたことによる,「狙い」の中断
