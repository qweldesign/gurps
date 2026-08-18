// Combat/Spells.ts

import { type ParameterKey } from '../Parameters'
import { type Aim } from './Action/types'

export const SPELL_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const

export const SPELL_ELEMENT_LABELS: Record<string, ParameterKey> = {
  wood: '木行術', fire: '火行術', earth: '土行術', metal: '金行術', water: '水行術'
} as const

const WOOD_SPELL: Spell[] = [
  { id: 0, label: 'ヘイスト', spellType: 'assist', spellCast: 1, effects: [{ kind: 'buff', target: 'ev' }], targetScope: 'ally' },
  { id: 1, label: '茨の呪縛', spellType: 'shoot', spellCast: 1, effects: [{ kind: 'dmg', dice: 1, dmgType: 2, aim: 'foot', allowParry: false }], targetScope: 'enemy' },
  { id: 2, label: '風の刃', spellType: 'shoot', spellCast: 2, effects: [{ kind: 'dmg', dice: 2, dmgType: 1 }], targetScope: 'enemy' },
  { id: 3, label: 'サイレンス', spellType: 'resist', spellCast: 2, effects: [{ kind: 'debuff', target: 'silence', duration: 'margin' }], targetScope: 'enemy' },
  { id: 4, label: 'リストレーション', spellType: 'range', spellCast: 3, effects: [{ kind: 'cleanse' }] },
  { id: 5, label: '召雷', spellType: 'shoot', spellCast: 3, effects: [{ kind: 'dmg', dice: 3, dmgType: 0, metalPenalty: true }], targetScope: 'enemy' }
] as const

const FIRE_SPELL: Spell[] = [
  { id: 0, label: 'ヒロイズム', spellType: 'assist', spellCast: 1, effects: [{ kind: 'buff', target: 'level' }], targetScope: 'ally' },
  { id: 1, label: '閃光', spellType: 'range', spellCast: 1, effects: [{ kind: 'flash', allowParry: false }] },
  { id: 2, label: '火球', spellType: 'shoot', spellCast: 2, effects: [{ kind: 'dmg', dice: 2, dmgType: 0, burnOnDmg: true }], targetScope: 'enemy' },
  { id: 3, label: '炎の嵐', spellType: 'range', spellCast: 2 },
  { id: 4, label: '火の鳥', spellType: 'range', spellCast: 3 },
  { id: 5, label: '焼殺', spellType: 'shoot', spellCast: 3, effects: [{ kind: 'dmg', dice: 4, dmgType: 0, burnOnDmg: true }], targetScope: 'enemy' }
] as const

const EARTH_SPELL: Spell[] = [
  { id: 0, label: 'ベルセルク', spellType: 'resist', spellCast: 1, effects: [{ kind: 'buff', target: 'dmg' }, { kind: 'debuff', target: 'berserk', duration: 1 }], targetScope: 'all' },
  { id: 1, label: 'アースハンド', spellType: 'shoot', spellCast: 1, effects: [{ kind: 'trip', mod: -2, aim: 'foot', allowParry: false }], targetScope: 'enemy' },
  { id: 2, label: '大地の癒し', spellType: 'recover', spellCast: 2, effects: [{ kind: 'heal', maxUses: 1, fraction: 0.5, cureLimbInjury: true }], targetScope: 'ally' },
  { id: 3, label: '痛覚鈍麻', spellType: 'resist', spellCast: 2, effects: [{ kind: 'status', target: 'resistant', duration: 10 }, { kind: 'debuff', target: 'dazed', duration: 1, resistMod: -2 }], targetScope: 'ally' },
  { id: 4, label: '傀儡', spellType: 'other', spellCast: 1 },
  { id: 5, label: '瓦礫の雨', spellType: 'range', spellCast: 3 }
] as const

const METAL_SPELL: Spell[] = [
  { id: 0, label: '金縛り', spellType: 'resist', spellCast: 1, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin' }], targetScope: 'enemy' },
  { id: 1, label: '杯', spellType: 'recover', spellCast: 1, effects: [{ kind: 'heal', maxUses: 2, cureStun: true }], targetScope: 'ally' },
  { id: 2, label: '金貨', spellType: 'resist', spellCast: 2, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin', resistMod: -2 }], targetScope: 'enemy' },
  { id: 3, label: '盾', spellType: 'defense', spellCast: 2 },
  { id: 4, label: 'サイレン', spellType: 'range', spellCast: 3 },
  { id: 5, label: '塔', spellType: 'shoot', spellCast: 3, effects: [{ kind: 'dmg', dice: 3, dmgType: 1 }], targetScope: 'enemy' }
] as const

const WATER_SPELL: Spell[] = [
  { id: 0, label: '生命の雫', spellType: 'recover', spellCast: 1, effects: [{ kind: 'heal', maxUses: 2, fraction: 1 / 3, cureLimbInjury: true }], targetScope: 'ally' },
  { id: 1, label: 'ぼんやり', spellType: 'resist', spellCast: 1, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin' }], targetScope: 'enemy' },
  { id: 2, label: '水舞', spellType: 'assist', spellCast: 2, effects: [{ kind: 'buff', target: 'dr' }], targetScope: 'ally' },
  { id: 3, label: '濃霧', spellType: 'other', spellCast: 2 },
  { id: 4, label: '時間遡行', spellType: 'defense', spellCast: 3 },
  { id: 5, label: '吹雪', spellType: 'range', spellCast: 3 }
] as const

export const SPELL_LIST: Record<SpellElement, Spell[]> = {
  wood: WOOD_SPELL,
  fire: FIRE_SPELL,
  earth: EARTH_SPELL,
  metal: METAL_SPELL,
  water: WATER_SPELL
}

// 五行
export type SpellElement = typeof SPELL_ELEMENTS[number]

// 技能群
export type Spells = Record<SpellElement, number>

// 型分類
type SpellType = 'assist' | 'resist' | 'shoot' | 'range' | 'recover' | 'defense' | 'other'

// バフ効果の対象 (StatusBuffの対応する加算メソッドに対応)
export type SpellBuffTarget = 'level' | 'dmg' | 'ev' | 'dr'

// バフ効果のログ表示用ラベル
export const SPELL_BUFF_LABELS: Record<SpellBuffTarget, string> = {
  level: '命中', dmg: '攻撃', ev: '回避', dr: '防御'
} as const

// デバフ効果の対象 (StatusEffectsのフィールドに対応)
export type StatusEffectTarget = 'silence' | 'resistant' | 'poisoned' | 'paralyzed' | 'dazed' | 'berserk' | 'panic'

// デバフ効果のログ表示用ラベル (StatusEffects.label のものと揃える)
export const STATUS_EFFECT_LABELS: Record<StatusEffectTarget, string> = {
  silence: '沈黙', resistant: '痛覚鈍麻', poisoned: '毒', paralyzed: '麻痺', dazed: '幻惑', berserk: '狂戦士', panic: 'パニック'
} as const

// 術の機械的効果 (対応するもののみ定義する. 未定義の術は今のところ演出のみ, もしくはGM裁定に委ねる)
// buff: 発動判定成功で無条件に適用する (StatusBuff の数値バフ)
// status: 発動判定成功で無条件に適用する (StatusEffects のフィールドを直接使う, 抵抗判定を伴わない状態異常/状態効果. 例: 「痛覚鈍麻」の本体効果)
// debuff: 対象の抵抗判定 (MREを使用) に失敗した場合のみ適用する. duration が 'margin' なら抵抗判定の失敗度をそのままターン数とし,
// 数値なら固定ターン数とする (例: ベルセルクの「そのターンのみ」は 1). resistMod は抵抗判定自体への修正 (例: 「痛覚鈍麻」「金貨」の -2. 未指定は 0)
// dmg: 直接ダメージ型 (射撃呪文). 対象は「受け」-4/「止め」-2/「よけ」で回避判定を行い, 失敗すればダイス数・ダメージ型に応じたダメージを受ける
// (DR減算・部位狙いによる負傷上限/故障・朦朧/転倒・気絶/死亡までの解決は, 通常の攻撃・射撃と共通のロジックを用いる)
// trip: dmg と同じ回避判定を経た上で, ダメージの代わりに転倒判定 (mod 付き) のみを行う (「アースハンド」用)
// aim: 未指定なら 'body' (通常の射撃呪文). allowParry: 未指定なら true. 足首を狙う術など「受け」による回避が許されない場合のみ false を指定する
// metalPenalty: true の場合, 対象の (aim部位に対応する) 防具が金属製 (SDR > 2, チェインメイル以上) なら,
// 回避判定に一律 -2 の修正を与え, かつダメージ計算でDRを無視する (例: 「召雷」)
// burnOnDmg: true の場合, DRを引いたダメージが4点以上で対象を火だるま状態 (Health.burning) にする (例: 「火球」「焼殺」)
// 水舞のDRバフ (水の鎧) を纏っている対象は免れる. 火だるま状態のユニットは次の自ターン開始時に自動で「消火」を行う (行動を消費する)
// flash: 範囲呪文 (spellType: 'range') 専用. 対象選択は行わず, 発動時点の敵全員に対して個別に dmg と同様の回避判定 ( 「受け」-4/「止め」-2/「よけ」, が false なら「受け」を除く) を行う.
// 回避に失敗した対象のみ, そのターン中 (対象自身の次ターン終了時まで) 命中判定-4・回避判定-2のペナルティ (StatusEffects.flashed) を受ける (例: 「閃光」).
// ペナルティの数値は状態異常自体に固定で紐づく (朦朧状態の防御-4などと同様) ため, 効果データ側では持たない
// heal: 回復呪文 (spellType: 'recover') 専用. 判定・抵抗を伴わず対象 (targetScope: 'ally') に無条件で適用する.
// fraction 指定時は最大HPに fraction を掛けた分だけ負傷を軽減する (端数切り捨て. 実際の負傷分でキャップする). 
// cureStun/cureLimbInjury で朦朧状態・腕脚の故障 (injuryOnArm/injuryOnLeg) をそれぞれ治癒する (気絶 (unconscious) 状態からの復帰は行わない). 
// maxUses は対象ユニット1体につき, その術が戦闘中に効果を発揮できる回数の上限 (CombatUnit.healUses で対象・術ごとに使用回数を管理する. 上限に達した場合, 発動はするが効果は得られない)
// cleanse: 範囲呪文 (spellType: 'range') 専用. 対象選択は行わず, 発動時点の味方全員 (術者自身を含む) に対し, 判定を伴わず無条件で
// 朦朧状態・幻惑状態 (StatusEffects.dazed)・狂戦士状態 (StatusEffects.berserk)・混乱状態 (Health.confused) を解除する (例: 「リストレーション」)
// spellType: 'defense' の術 (「盾」「時間遡行」) は, 通常の「法術」行動 (対象選択・即時効果) を経由せず, 対象自身が攻撃を受けた際に反応して発動する
// 特殊な術のため, SpellEffect の kind としては定義しない (effects.ts 側に個別の反応ロジックとしてハードコードする. 例: 「盾」の spellCast.metal >= 2 判定)
// 「盾」: 精神集中(金)が2ターン以上完了している状態で攻撃を受けると, 通常の防御試行回数とは別枠で, 術の技能値による「止め」相当の追加防御を自動発動する
// (最初に判定し, 成否を問わず精神集中(金)をリセットする. 物理攻撃・術による攻撃のいずれに対しても発動する)
// 「時間遡行」は未実装 (発動条件・効果とも別途検討する)
export type SpellEffect =
  | { kind: 'buff', target: SpellBuffTarget }
  | { kind: 'status', target: StatusEffectTarget, duration: number }
  | { kind: 'debuff', target: StatusEffectTarget, duration: number | 'margin', resistMod?: number }
  | { kind: 'dmg', dice: number, dmgType: number, aim?: Aim, allowParry?: boolean, metalPenalty?: boolean, burnOnDmg?: boolean }
  | { kind: 'trip', mod?: number, aim?: Aim, allowParry?: boolean }
  | { kind: 'flash', allowParry?: boolean }
  | { kind: 'heal', maxUses: number, fraction?: number, cureStun?: boolean, cureLimbInjury?: boolean }
  | { kind: 'cleanse' }

// 術の対象範囲 (対象選択パレットでどのユニット群から選ばせるか)
export type SpellTargetScope = 'ally' | 'enemy' | 'all'

// 法術
type Spell = {
  id: number
  label: string
  spellType: SpellType
  spellCast: number
  effects?: SpellEffect[]
  targetScope?: SpellTargetScope // 対応する効果がある場合のみ指定する (未指定の術は対象選択を行わず, 暫定的に自身を対象とする)
}
