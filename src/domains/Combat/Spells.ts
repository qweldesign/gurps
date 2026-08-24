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
  { id: 3, label: '炎の嵐', spellType: 'range', spellCast: 2, effects: [{ kind: 'dmg', dice: 2, dmgType: 0, burnOnDmg: true }] },
  { id: 4, label: '火の鳥', spellType: 'range', spellCast: 3, effects: [{ kind: 'dmg', dice: 3, dmgType: 0, burnOnDmg: true }] },
  { id: 5, label: '焼殺', spellType: 'shoot', spellCast: 3, effects: [{ kind: 'dmg', dice: 4, dmgType: 0, burnOnDmg: true }], targetScope: 'enemy' }
] as const

const EARTH_SPELL: Spell[] = [
  { id: 0, label: 'ベルセルク', spellType: 'resist', spellCast: 1, effects: [{ kind: 'buff', target: 'dmg' }, { kind: 'debuff', target: 'berserk', duration: 1 }], targetScope: 'all' },
  { id: 1, label: 'アースハンド', spellType: 'shoot', spellCast: 1, effects: [{ kind: 'trip', mod: -2, aim: 'foot', allowParry: false }], targetScope: 'enemy' },
  { id: 2, label: '大地の癒し', spellType: 'recover', spellCast: 2, effects: [{ kind: 'heal', maxUses: 1, fraction: 0.5, cureLimbInjury: true }], targetScope: 'ally' },
  { id: 3, label: '痛覚鈍麻', spellType: 'resist', spellCast: 2, effects: [{ kind: 'status', target: 'resistant', duration: 10 }, { kind: 'debuff', target: 'dazed', duration: 1, resistMod: -2 }], targetScope: 'ally' },
  { id: 4, label: '傀儡', spellType: 'other', spellCast: 1, effects: [{ kind: 'puppet' }], targetScope: 'puppet' },
  {
    id: 5, label: '瓦礫の雨', spellType: 'range', spellCast: 3, effects: [
      { kind: 'dmg', dice: 2, dmgType: 0, randomTarget: true },
      { kind: 'dmg', dice: 2, dmgType: 1, randomTarget: true },
      { kind: 'dmg', dice: 2, dmgType: 2, randomTarget: true }
    ]
  }
] as const

const METAL_SPELL: Spell[] = [
  { id: 0, label: '金縛り', spellType: 'resist', spellCast: 1, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin' }], targetScope: 'enemy' },
  { id: 1, label: '杯', spellType: 'recover', spellCast: 1, effects: [{ kind: 'heal', maxUses: 2, cureStun: true }], targetScope: 'ally' },
  { id: 2, label: '金貨', spellType: 'resist', spellCast: 2, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin', resistMod: -2 }], targetScope: 'enemy' },
  { id: 3, label: '盾', spellType: 'defense', spellCast: 2 },
  { id: 4, label: 'サイレン', spellType: 'range', spellCast: 3, effects: [{ kind: 'debuffAll', target: 'berserk', duration: 1, enemyResistMod: -2, allyResistMod: 2 }] },
  { id: 5, label: '塔', spellType: 'shoot', spellCast: 3, effects: [{ kind: 'dmg', dice: 3, dmgType: 1 }], targetScope: 'enemy' }
] as const

const WATER_SPELL: Spell[] = [
  { id: 0, label: '生命の雫', spellType: 'recover', spellCast: 1, effects: [{ kind: 'heal', maxUses: 2, fraction: 1 / 3, cureLimbInjury: true }], targetScope: 'ally' },
  { id: 1, label: 'ぼんやり', spellType: 'resist', spellCast: 1, effects: [{ kind: 'debuff', target: 'dazed', duration: 'margin' }], targetScope: 'enemy' },
  { id: 2, label: '水舞', spellType: 'assist', spellCast: 2, effects: [{ kind: 'buff', target: 'dr' }], targetScope: 'ally' },
  { id: 3, label: '濃霧', spellType: 'other', spellCast: 2, effects: [{ kind: 'fog' }] },
  { id: 4, label: '時間遡行', spellType: 'defense', spellCast: 3 },
  { id: 5, label: '吹雪', spellType: 'range', spellCast: 3, effects: [{ kind: 'dmg', dice: 4, dmgType: 0 }] }
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

/*
 * 術の機械的効果 (対応するもののみ定義する. 未定義の術は今のところ演出のみ, もしくはGM裁定に委ねる)
 *
 * buff: 発動判定成功で無条件に適用する (StatusBuff の数値バフ)
 *
 * status: 発動判定成功で無条件に適用する (StatusEffects のフィールドを直接使う, 抵抗判定を伴わない状態異常/状態効果. 例: 「痛覚鈍麻」の本体効果)
 *
 * debuff: 対象の抵抗判定 (MREを使用) に失敗した場合のみ適用する. duration が 'margin' なら抵抗判定の失敗度をそのままターン数とし,
 * 数値なら固定ターン数とする (例: ベルセルクの「そのターンのみ」は 1). resistMod は抵抗判定自体への修正 (例: 「痛覚鈍麻」「金貨」の -2. 未指定は 0)
 *
 * dmg: 直接ダメージ型 (射撃呪文, および範囲呪文 (spellType: 'range') での使用も可). 対象は「受け」-4/「止め」-2/「よけ」で回避判定を行い, 失敗すればダイス数・ダメージ型に応じたダメージを受ける
 * (DR減算・部位狙いによる負傷上限/故障・朦朧/転倒・気絶/死亡までの解決は, 通常の攻撃・射撃と共通のロジックを用いる)
 * spellType: 'range' で用いる場合, 対象選択を経ず, 発動時点の敵全員に対して個別に (flash と同様) 上記の回避判定・ダメージ解決を行う (例: 「炎の嵐」「火の鳥」「吹雪」)
 * randomTarget: true の場合, spellType: 'range' において敵全員ではなく, 発動時点の敵からランダムに1体を選び, その対象にのみ上記の解決を行う
 * (敵が0体なら何も起きない. 効果を複数 (同じ kind: 'dmg' を複数個) 指定すれば, 各効果ごとに独立してランダムな対象を選び直す (同じ対象に重複しうる. 例:「瓦礫の雨」の3回))
 * aim: 未指定なら 'body' (通常の射撃呪文). allowParry: 未指定なら true. 足首を狙う術など「受け」による回避が許されない場合のみ false を指定する
 * metalPenalty: true の場合, 対象の (aim部位に対応する) 防具が金属製 (SDR > 2, チェインメイル以上) なら,
 * 回避判定に一律 -2 の修正を与え, かつダメージ計算でDRを無視する (例: 「召雷」)
 * burnOnDmg: true の場合, DRを引いたダメージが4点以上で対象を火だるま状態 (Health.burning) にする (例: 「火球」「焼殺」)
 * 水舞のDRバフ (水の鎧) を纏っている対象は免れる. 火だるま状態のユニットは次の自ターン開始時に自動で「消火」を行う (行動を消費する)
 *
 * trip: dmg と同じ回避判定を経た上で, ダメージの代わりに転倒判定 (mod 付き) のみを行う (「アースハンド」用)
 *
 * flash: 範囲呪文 (spellType: 'range') 専用. 対象選択は行わず, 発動時点の敵全員に対して個別に dmg と同様の回避判定 ( 「受け」-4/「止め」-2/「よけ」, が false なら「受け」を除く) を行う.
 * 回避に失敗した対象のみ, そのターン中 (対象自身の次ターン終了時まで) 命中判定-2・回避判定-1のペナルティ (StatusEffects.flashed) を受ける (例: 「閃光」).
 * ペナルティの数値は状態異常自体に固定で紐づく (朦朧状態の防御-4などと同様) ため, 効果データ側では持たない
 *
 * heal: 回復呪文 (spellType: 'recover') 専用. 判定・抵抗を伴わず対象 (targetScope: 'ally') に無条件で適用する.
 * fraction 指定時は最大HPに fraction を掛けた分だけ負傷を軽減する (端数切り捨て. 実際の負傷分でキャップする).
 * cureStun/cureLimbInjury で朦朧状態・腕脚の故障 (injuryOnArm/injuryOnLeg) をそれぞれ治癒する (気絶 (unconscious) 状態からの復帰は行わない).
 * maxUses は対象ユニット1体につき, その術が戦闘中に効果を発揮できる回数の上限 (CombatUnit.healUses で対象・術ごとに使用回数を管理する. 上限に達した場合, 発動はするが効果は得られない)
 *
 * cleanse: 範囲呪文 (spellType: 'range') 専用. 対象選択は行わず, 発動時点の味方全員 (術者自身を含む) に対し, 判定を伴わず無条件で
 * 朦朧状態・幻惑状態 (StatusEffects.dazed)・狂戦士状態 (StatusEffects.berserk)・混乱状態 (Health.confused) を解除する (例: 「リストレーション」)
 *
 * debuffAll: 範囲呪文 (spellType: 'range') 専用のデバフ. debuff と同じく対象の抵抗判定 (MRE) に失敗した場合のみ適用するが,
 * 対象選択は行わず, 発動時点の敵味方全員 (術者自身を除く) に対して個別に抵抗判定を行う.
 * 抵抗判定への修正は術者から見て敵か味方かで異なる (enemyResistMod/allyResistMod, 未指定はそれぞれ0. 例:「サイレン」の敵-2/味方+2)
 * duration の扱いは debuff と同じ (数値なら固定ターン数, 'margin' なら抵抗判定の失敗度をそのままターン数とする)
 *
 * puppet: 対象選択は targetScope: 'puppet' 専用の対象プール (幻惑状態, もしくは気絶・死亡している, 敵味方を問わない全ユニット) から行う (「傀儡」用)
 * 発動判定成功で無条件に適用し, 対象のターンへその場で即座に移行する (通常の行動順を待たない, その場限りの1ターンのみの制御. Health.puppeted は移行中のみ true になる)
 * 対象の「攻撃」の近接ターゲットは, 位置・後列を問わず本来の所属陣営の全ユニット (元の「味方」) に反転する (getMeleeTargets 参照)
 * 「集中」「法術」「射撃」「狙い」「特殊攻撃 (全力攻撃)」「全力防御」「移動」は行えない (複数ターンにまたがる仕組みとの整合を避けるため, および被攻撃対象にならないため)
 * 幻惑状態によるコマンド封じ (StatusEffects.dazed) は無視する (元々幻惑・気絶・死亡のいずれかの状態にある対象のため)
 *
 * fog: 対象を持たない, 戦場全体への持続効果 (spellType: 'other'). 判定・抵抗を伴わず, 発動判定成功で CombatState.foggy を true にする
 * (再発動しても変化なし. 一度発生すれば戦闘終了まで持続する (時間経過での減衰は無い)). 射撃武器の距離による修正 (distanceMod) を2倍にする (「濃霧」)
 * 術の発動判定に対する距離による修正 (後述) も同様に2倍になる
 *
 * 【術の発動判定に対する距離による修正】 射撃武器の distanceMod と全く同じ考え方で, 対象が離れているほど,
 * 術者自身の発動判定 (judgeSpell) が失敗しやすくなるペナルティを課す (対象の防御・抵抗判定側には一切影響しない. 濃霧下では2倍になる点も射撃武器と共通)
 * 対象が単一に定まる術 (spellType: 'shoot' 全般, および spellType: 'resist' で対象が敵 (術者と別陣営) の場合) は,
 * その対象の配置に応じて前列 -1 / 後列 -2 (濃霧下ではそれぞれ -2 / -4) のペナルティを課す
 * 対象が味方・自身の場合 (「ベルセルク」targetScope: 'all' でも味方を対象に取る運用, 「痛覚鈍麻」targetScope: 'ally' 等) は 0 とする
 * spellType: 'range' (対象選択を経ず, 発動時点の敵全員, もしくは「瓦礫の雨」のようにランダムな1体に効果が及ぶ術) は,
 * 発動判定が1回のみで個々の対象の位置を一意に定められないため, dmg/flash 効果を持つものに限り, 位置によらず一律 -2 (濃霧下では -4) とする
 * 「サイレン」(debuffAll, 敵味方問わず及ぶ)・「リストレーション」(cleanse, 味方専用) は距離の概念が当てはまらないため対象外 (0) とする
 * (計算は Action/effects.ts の getSpellDistanceMod で行い, judgeSpell の distanceMod 引数として渡す. SpellEffect のデータ自体には持たない)
 *
 * 【術の発動判定のファンブル】
 * 発動判定 (judgeSpell) がファンブルだった場合, 術者自身がそのターンのみ幻惑状態 (StatusEffects.dazed) に陥る
 * 
 * spellType: 'defense' の術 (「盾」「時間遡行」, 下記) は「法術」行動 (spell()) を経由せず judgeSpell も呼ばないため, この仕組みの対象外となる
 * (適用は Action/effects.ts の spell() 内で行う. SpellEffect のデータ自体には持たない)
 *
 * spellType: 'defense' の術 (「盾」「時間遡行」) は, 通常の「法術」行動 (対象選択・即時効果) を経由せず, 自動的に反応して発動する
 * 特殊な術のため, SpellEffect の kind としては定義しない (個別の反応ロジックとしてハードコードする)
 * 「盾」: 精神集中(金)が2ターン以上完了している状態で攻撃を受けると, 通常の防御試行回数とは別枠で, 術の技能値による「止め」相当の追加防御を自動発動する
 * (最初に判定し, 成否を問わず精神集中(金)をリセットする. 物理攻撃・術による攻撃のいずれに対しても発動する. Action/effects.ts に実装)
 * 「時間遡行」: 精神集中(水)を3ターン以上維持している状態で, 敵のターンの解決が (全ての行動・ログ表示を含め) 完全に終わった時点において,
 * 術者ないし術者の味方が新たに重篤な状態 (死亡・気絶・転倒・目/耳/四肢の故障) に陥っていれば自動発動する (術の技能値でロールし, 成否を問わず精神集中(水)をリセットする)
 * 成功すると, そのユニットのターンで生じた状態変化を全て巻き戻す (State.ts の nextTurn に実装. 1回の攻撃単位ではなく, ターン全体が対象)
 * 術者自身が気絶・死亡している場合は (このターンでそうなった場合を含め) 行動不能とみなし発動しない (「転倒」は無条件解除ルールにより自身の集中も同時に途絶えるため, 元々自動的に対象外)
 */
export type SpellEffect =
  | { kind: 'buff', target: SpellBuffTarget }
  | { kind: 'status', target: StatusEffectTarget, duration: number }
  | { kind: 'debuff', target: StatusEffectTarget, duration: number | 'margin', resistMod?: number }
  | { kind: 'dmg', dice: number, dmgType: number, aim?: Aim, allowParry?: boolean, metalPenalty?: boolean, burnOnDmg?: boolean, randomTarget?: boolean }
  | { kind: 'trip', mod?: number, aim?: Aim, allowParry?: boolean }
  | { kind: 'flash', allowParry?: boolean }
  | { kind: 'heal', maxUses: number, fraction?: number, cureStun?: boolean, cureLimbInjury?: boolean }
  | { kind: 'cleanse' }
  | { kind: 'debuffAll', target: StatusEffectTarget, duration: number | 'margin', enemyResistMod?: number, allyResistMod?: number }
  | { kind: 'fog' }
  | { kind: 'puppet' }

// 術の対象範囲 (対象選択パレットでどのユニット群から選ばせるか)
// 'puppet' は幻惑状態, もしくは気絶・死亡しているユニット (敵味方を問わない) を対象とする (「傀儡」専用. CombatFormation.getPuppetTargets 参照)
export type SpellTargetScope = 'ally' | 'enemy' | 'all' | 'puppet'

// 法術
export type Spell = {
  id: number
  label: string
  spellType: SpellType
  spellCast: number
  effects?: SpellEffect[]
  targetScope?: SpellTargetScope // 対応する効果がある場合のみ指定する (未指定の術は対象選択を行わず, 暫定的に自身を対象とする)
}
